import { RemoteType, S3BucketName, RemoteUri, GpgKey, UploadedS3FilePart, Sha256FilePart, CommitType, ConfigFile, AbsoluteDirectoryPath, RelativeFilePath, Sha256, ByteCount, ModifiedDate, Callback, Sha256File, File, Filename, CommitFilename, Commit } from './Types';
import { rename, readFileSync, readFile } from 'fs';
import getToRemotePendingCommitStatsMapFunc from './getToRemotePendingCommitStatsMapFunc';
import getToRemotePendingCommitDeciderMapFunc from './getToRemotePendingCommitDeciderMapFunc';

import { getDependencies as getToFileMapFuncDependencies } from './getToFileMapFunc';
import getToFileMapFunc from './getToFileMapFunc';


import { getDependencies as getToDownloadedPartsMapFuncDependencies } from './getToDownloadedPartsMapFunc';
import getToDownloadedPartsMapFunc from './getToDownloadedPartsMapFunc';
import { getDependencies as getToRemotePendingCommitStatsDependencies } from './getToRemotePendingCommitStatsMapFunc';
import getCommitToBackupCheckDatabaseScanFunc from './getCommitToBackupCheckDatabaseScanFunc';
import CommitFilenameLocalFiles from './CommitFilenameLocalFiles';
import CommitFilenameS3 from './CommitFilenameS3';
import { RootReadable } from './RootReadable';
import { join } from 'path';
import commitSortFunction from './commitFilenameSorter';
import { getMergeInCommitType } from './getMergeInCommitType';
import { RightAfterLeft, FirstDuplex, FinalDuplex, ScanTransform, SortDuplex, ErrorStream, MapFunc, MapTransform, ParallelJoin } from 'streamdash';
import getLocalCommitFilenameToCommitMapFunc from './getLocalCommitFilenameToCommitMapFunc';
import { getFilenameToFileMapFunc } from './getFilenameToFileMapFunc';
import { getFileToSha256FileMapFunc, getRunner } from './getFileToSha256FileMapFunc';
import { Sha256FileToSha256FilePart } from './Sha256FileToSha256FilePart';
import { getDependencies as getSha256FilePartToUploadedS3FilePartDependencies } from './getSha256FilePartToUploadedS3FilePartMapFunc';
import getSha256FilePartToUploadedS3FilePartMapFunc from './getSha256FilePartToUploadedS3FilePartMapFunc';
import { getCommitToCommittedMapFuncDependencies, getCommitToCommittedMapFunc } from './getCommitToCommittedMapFunc';
import { UploadedS3FilePartsToCommit } from './UploadedS3FilePartsToCommit';
import { Duplex, Readable, Transform, Writable } from 'stronger-typed-streams';
import { CmdRunner } from './CmdRunner';
import getCommittedToUploadedS3CommittedMapFunc from './getCommittedToUploadedCommittedMapFunc';
import getCommittedToUploadedS3CommittedFakeMapFunc from './getCommittedToUploadedCommittedFakeMapFunc';
import { stat } from 'fs';
import getFileNotBackedUpRightAfterLeftMapFunc from './getFileNotBackedUpRightAfterLeftMapFunc';
// import getRemotePendingCommitToRemotePendingCommitLocalInfoRightAfterLeftMapFunc from './getRemotePendingCommitToRemotePendingCommitLocalInfoRightAfterLeftMapFunc';
import getToRemotePendingCommitInfoRightAfterLeftMapFunc from './getToRemotePendingCommitInfoRightAfterLeftMapFunc';
import { mapObjIndexed } from 'ramda';
import getRepositoryCommitToRemoteCommitMapFunc from './getRepositoryCommitToRemoteCommitMapFunc';
import * as mkdirp from 'mkdirp';
import { S3 } from 'aws-sdk';

class ConsoleWritable extends Writable<Object> {

    private name: string;
    private out: (...args) => void;

    constructor({out}, name: string) {
        super({objectMode: true});
        this.out = out;
        this.name = name;
    }

    _write(ob, encoding, cb) {
        if (ob instanceof Error) {
            this.out("Error Caught!");
            this.out(this.name, ob.message);
            this.out(this.name, ob.stack);
        }
        this.out(this.name, JSON.stringify(ob));
        cb();
    }
}

function getPreparePipe(es: ErrorStream) {
    return (p) => {
        es.add(p);
        return p;
    };
}

let errorStream = new ErrorStream({objectMode: true}),
    errorOut = new ConsoleWritable({out: console.log}, "EEError: "),
    preparePipe = getPreparePipe(errorStream);


errorStream.pipe(errorOut);



function getSortedCommitFilenamePipe(rootDir, dirs): Transform<RelativeFilePath, CommitFilename> {
    let globber = RootReadable.getGlobFunc();

    let strms = dirs.map((d: string) => {
        let s = new RootReadable({glob: globber}, join(rootDir, d), []);
        let t = new MapTransform(
            getMergeInCommitType({commitType: d}),
            {objectMode: true}
        );
        return  preparePipe(s.pipe(t));
    });

    // TODO: Cannot pipe multile items into one. Look at creating a JoinDuplex
    let commitSorter = new SortDuplex(commitSortFunction, { objectMode: true });

    let pjoin = new ParallelJoin({objectMode: true});

    strms.forEach(s => {
        s.pipe(pjoin.add({objectMode: true}));
    });

    pjoin.pipe(commitSorter);

    return preparePipe(commitSorter);
}

function removeProtocol(s: RemoteUri): S3BucketName {
    return s.replace(/^[a-z0-9]+\:\/\//, '');
}

function getRemoteType(remote: RemoteUri) {
    if (remote.match(/^s3\:\/\//)) {
        return RemoteType.S3;
    }

    if (remote.match(/^file\:\/\//)) {
        return RemoteType.LOCAL_FILES;
    }

    throw new Error("Cannot figure out remote type from RemoteUri: " + remote);
}

function getSha256FilePartToUploadedFilePart(rootDir: AbsoluteDirectoryPath, remote: RemoteUri, gpgKey: GpgKey): MapFunc<Sha256FilePart, UploadedS3FilePart> {

    if (remote.match(/^s3\:\/\//)) {
        return getSha256FilePartToUploadedS3FilePartMapFunc(
            getSha256FilePartToUploadedS3FilePartDependencies(RemoteType.S3),
            rootDir,
            removeProtocol(remote),
            gpgKey,
            './bash/upload-filepart-s3'
        );
    }

    if (remote.match(/^file\:\/\//)) {
        return getSha256FilePartToUploadedS3FilePartMapFunc(
            getSha256FilePartToUploadedS3FilePartDependencies(RemoteType.LOCAL_FILES),
            rootDir,
            removeProtocol(remote),
            gpgKey,
            './bash/upload-filepart-cat'
        );
    }

    throw new Error("NO_REMOTE_PROTOCOL: Cannot figure out where to copy file parts");
}


function getCommittedToUploadedCommittedMapFunc(configDir: AbsoluteDirectoryPath, remote: RemoteUri, gpgKey: GpgKey) {

    if (remote.match(/^s3\:\/\//)) {
        return getCommittedToUploadedS3CommittedMapFunc(
            configDir,
            removeProtocol(remote),
            gpgKey,
            './bash/upload-commit-s3'
        );
    }

    if (remote.match(/^file\:\/\//)) {
        return getCommittedToUploadedS3CommittedMapFunc(
            configDir,
            removeProtocol(remote),
            gpgKey,
            './bash/upload-commit-cat'
        );
    }

    throw new Error("NO_REMOTE_PROTOCOL: Cannot figure out where to copy file parts");
}

function readConfig(configDir: AbsoluteDirectoryPath) {
    let cf = join(configDir, 'config');
    try {
        return JSON.parse(readFileSync(cf, {encoding: 'utf8'}));
    }
    catch (e) {
        throw new Error(`Config file '${cf}' does not appear to be ` +
            `valid JSON`);
    }
}

export function upload(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {

    // TODO: Should compare SHA's if the timestamps have changed...

    let stdPipeOptions = { objectMode: true, highWaterMark: 1},
        tmpDir = join(configDir, "tmp"),
        commitDir = 'commit',
        remoteCommitDir = 'remote-commit',
        config: ConfigFile = readConfig(configDir),
        clientId = config['client-id'],
        filePartByteCountThreshold = 1024 * 1024 * 64, // 64MB
        commitFileByteCountThreshold = 1024 * 1024 * 256, // 256MB
        commitMaxDelay = 1000 * 60 * 5,
        s3Bucket = config.remote,
        gpgKey = config['gpg-encryption-key'],
        rootReader = new RootReadable(
            {glob: RootReadable.getGlobFunc()},
            rootDir,
            []
        ),
        filenameToFile = new MapTransform(
            getFilenameToFileMapFunc({ stat }, rootDir),
            stdPipeOptions
        ),
        fileToSha256FileMapFunc = getFileToSha256FileMapFunc(
            { runner: getRunner({ cmdSpawner: CmdRunner.getCmdSpawner({}) }) },
            rootDir
        ),
        fileToSha256File = new MapTransform(fileToSha256FileMapFunc, stdPipeOptions),
        fileToSha256FilePart = new Sha256FileToSha256FilePart(
            rootDir,
            filePartByteCountThreshold,
            stdPipeOptions
        ),
        uploadedS3FilePartsToCommit = new UploadedS3FilePartsToCommit(
            UploadedS3FilePartsToCommit.getDependencies(),
            clientId,
            commitFileByteCountThreshold,
            commitMaxDelay,
            {}
        ),
        sha256FilePartToUploadedS3FilePart = new MapTransform(
            getSha256FilePartToUploadedFilePart(
                rootDir,
                config.remote,
                gpgKey
            ),
            stdPipeOptions
        ),
        commitToCommitted = new MapTransform(
            getCommitToCommittedMapFunc(
                getCommitToCommittedMapFuncDependencies(),
                configDir
            ),
            stdPipeOptions
        ),
        commitedToUploadedCommitted = new MapTransform(
            getCommittedToUploadedCommittedMapFunc(
                configDir,
                s3Bucket,
                gpgKey,
            ),
            {objectMode: true}
        ),
        localCommitFileToCommit = new MapTransform(
            getLocalCommitFilenameToCommitMapFunc(
                { readFile },
                configDir
            ),
            stdPipeOptions
        ),
        commitToBackupCheckDatabase = new ScanTransform(
            getCommitToBackupCheckDatabaseScanFunc({}),
            {},
            { objectMode: true }
        ),
        backupCheckDatabaseFinal = new FinalDuplex({objectMode: true});

    let fileNotBackedUpRightAfterLeft = new RightAfterLeft(
            getFileNotBackedUpRightAfterLeftMapFunc({}),
            { objectMode: true }
        );


    getSortedCommitFilenamePipe(configDir, [commitDir, remoteCommitDir])
        .pipe(preparePipe(localCommitFileToCommit))
        .pipe(preparePipe(commitToBackupCheckDatabase))
        .pipe(preparePipe(backupCheckDatabaseFinal))
        .pipe(preparePipe(fileNotBackedUpRightAfterLeft.left));


    let listFiles = preparePipe(rootReader)
        .pipe(preparePipe(filenameToFile))
        .pipe(preparePipe(fileNotBackedUpRightAfterLeft.right));


    let backup = fileNotBackedUpRightAfterLeft
        .pipe(preparePipe(fileToSha256File))
        .pipe(preparePipe(fileToSha256FilePart))
        .pipe(preparePipe(sha256FilePartToUploadedS3FilePart)) // TODO: Loses 0 length files
        .pipe(preparePipe(uploadedS3FilePartsToCommit))
        .pipe(preparePipe(commitToCommitted))
        .pipe(preparePipe(commitedToUploadedCommitted));

    backup.pipe(new ConsoleWritable({out: console.log}, "LogObj: "));

}

export function fetch(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {


    let stdPipeOptions = { objectMode: true, highWaterMark: 1},
        cmdSpawner = CmdRunner.getCmdSpawner({}),
        config: ConfigFile = readConfig(configDir),
        remoteType = getRemoteType(config.remote),
        globber = RootReadable.getGlobFunc(),
        repositoryCommitFiles: null|Readable<Filename> = null,
        cmd: string = '';

    if (remoteType == RemoteType.LOCAL_FILES) {
        cmd = 'bash/download-cat'
        repositoryCommitFiles = preparePipe(new CommitFilenameLocalFiles(
            {glob: globber},
            removeProtocol(config['remote']),
            { objectMode: true }
        ));
    }


    if (remoteType == RemoteType.S3) {
        cmd = 'bash/download-s3'
        repositoryCommitFiles = preparePipe(new CommitFilenameS3(
            new S3(),
            removeProtocol(config['remote']),
            { objectMode: true }
        ));
    }

    if (repositoryCommitFiles === null) {
        throw new Error("Could not identify repository type");
    }

    let toRemoteCommit = preparePipe(new MapTransform(
        getRepositoryCommitToRemoteCommitMapFunc(
            {cmdSpawner: cmdSpawner, rename: rename, mkdirp},
            configDir,
            removeProtocol(config['remote']),
            config['gpg-encryption-key'],
            cmd
        ),
        { objectMode: true }
    ));

    let toDebugConsole = preparePipe(
        new ConsoleWritable({out: console.log}, "LogObj: ")
    );
    toDebugConsole.on('finish', function() { console.log("FIN"); });
    toDebugConsole.on('end', function() { console.log("END"); });
    toDebugConsole.on('error', function() { console.log("ERR"); });

    // repositoryCommitFiles.pipe(toDebugConsole);
    repositoryCommitFiles.pipe(toRemoteCommit);
    toRemoteCommit.pipe(toDebugConsole);


}

export function download(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {

    let stdPipeOptions = { objectMode: true, highWaterMark: 1};

    let toDebugConsole = preparePipe(
        new ConsoleWritable({out: console.log}, "LogObj: ")
    );

    let config: ConfigFile = readConfig(configDir);

    let remoteType = getRemoteType(config.remote);

    toDebugConsole.on('finish', function() { console.log("FIN"); });
    toDebugConsole.on('end', function() { console.log("END"); });

    function getCommitStream(configDir: AbsoluteDirectoryPath, subDirs: string[], onlyFirst: boolean) {


        let sortedPendingCommitFilenameStream = getSortedCommitFilenamePipe(
            configDir,
            subDirs
        );

        let toCommitStream = preparePipe(
            new MapTransform(
                getLocalCommitFilenameToCommitMapFunc(
                    { readFile },
                    configDir
                ),
                stdPipeOptions
            )
        );

        return sortedPendingCommitFilenameStream
            .pipe(toCommitStream);
    }


    let remotePendingCommitStream = getCommitStream(
        configDir,
        ['remote-pending-commit'],
        false
    );

    let processedCommitStream = getCommitStream(
            configDir,
            ['commit', 'remote-commit'],
            false
        );

    let toBackupCheckDatabaseScan = preparePipe(new ScanTransform(
            getCommitToBackupCheckDatabaseScanFunc({}),
            {},
            stdPipeOptions
        ));

    let toBackupCheckDatabaseFinal = preparePipe(new FinalDuplex(stdPipeOptions));

    processedCommitStream
        .pipe(toBackupCheckDatabaseScan)
        .pipe(toBackupCheckDatabaseFinal);

    let remotePendingCommitLocalInfoStream = preparePipe(new RightAfterLeft(
            getToRemotePendingCommitInfoRightAfterLeftMapFunc({}),
            stdPipeOptions
        ));

    let toRemotePendingCommitStatsMapFunc = getToRemotePendingCommitStatsMapFunc(
            getToRemotePendingCommitStatsDependencies(),
            rootDir
        ),
        toRemotePendingCommitStats = preparePipe(
            new MapTransform(
                toRemotePendingCommitStatsMapFunc,
                stdPipeOptions
            )
        );

    let toRemotePendingCommitDecider = preparePipe(
        new MapTransform(
            getToRemotePendingCommitDeciderMapFunc({}),
            stdPipeOptions
        )
    );

    let toDownloadedParts = preparePipe(new MapTransform(
        getToDownloadedPartsMapFunc(
            getToDownloadedPartsMapFuncDependencies(remoteType),
            configDir,
            removeProtocol(config.remote)
        ),
        stdPipeOptions
    ));

    let toFile = preparePipe(new MapTransform(
        getToFileMapFunc(
            getToFileMapFuncDependencies(),
            config['gpg-encryption-key'],
            configDir,
            rootDir
        ),
        stdPipeOptions
    ));


    remotePendingCommitStream.pipe(remotePendingCommitLocalInfoStream.right);
    processedCommitStream.pipe(remotePendingCommitLocalInfoStream.left);


    remotePendingCommitLocalInfoStream
        .pipe(toRemotePendingCommitStats)
        .pipe(toRemotePendingCommitDecider)
        .pipe(toDownloadedParts)
        .pipe(toFile)
        .pipe(toDebugConsole);


    // toDownloadedParts:
    //   For every part
    //     Look at remote filesize
    //     If same as local
    //       Contine
    //     Download
    // toSynchedParts:
    //   Cat all of them through GPG into new file
    //   Do a move
    //   RemoveParts

}


