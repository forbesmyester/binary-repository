import { RemoteType, S3BucketName, RemoteUri, GpgKey, UploadedS3FilePart, Sha256FilePart, CommitType, ConfigFile, AbsoluteDirectoryPath, RelativeFilePath, Sha256, ByteCount, ModifiedDate, Callback, Sha256File, File, Filename, CommitFilename, Commit } from './Types';
import { rename, readFileSync, readFile } from 'fs';
import getToRemotePendingCommitStatsMapFunc from './getToRemotePendingCommitStatsMapFunc';
import safeSize from './safeSize';
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
import { dirname, join } from 'path';
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

const bashDir = join(dirname(dirname(__dirname)), 'bash');

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
            process.exit(1);
        }
        this.out(this.name, JSON.stringify(ob));
        cb();
    }
}

function getPreparePipe(es: ErrorStream) {
    return (p) => {
        es.add(p);
        p.on('error', (e) => {
            throw e;
        });
        return p;
    };
}

let errorStream = new ErrorStream({objectMode: true}),
    errorOut = new ConsoleWritable({out: console.log}, "Error: "),
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

function getSha256FilePartToUploadedFilePart(rootDir: AbsoluteDirectoryPath, remote: RemoteUri, gpgKey: GpgKey, filePartByteCountThreshold: number): MapFunc<Sha256FilePart, UploadedS3FilePart> {

    if (remote.match(/^s3\:\/\//)) {
        return getSha256FilePartToUploadedS3FilePartMapFunc(
            getSha256FilePartToUploadedS3FilePartDependencies(RemoteType.S3),
            rootDir,
            removeProtocol(remote),
            gpgKey,
            filePartByteCountThreshold,
            join(bashDir, 'upload-s3')
        );
    }

    if (remote.match(/^file\:\/\//)) {
        return getSha256FilePartToUploadedS3FilePartMapFunc(
            getSha256FilePartToUploadedS3FilePartDependencies(RemoteType.LOCAL_FILES),
            rootDir,
            removeProtocol(remote),
            gpgKey,
            filePartByteCountThreshold,
            join(bashDir, 'upload-cat')
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

export function push(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {

    function getCommittedToUploadedCommittedMapFunc(configDir: AbsoluteDirectoryPath, remote: RemoteUri, gpgKey: GpgKey) {

        if (remote.match(/^s3\:\/\//)) {
            return getCommittedToUploadedS3CommittedMapFunc(
                { mkdirp, cmdSpawner: CmdRunner.getCmdSpawner({}), rename },
                configDir,
                removeProtocol(remote),
                gpgKey,
                join(bashDir, 'upload-s3')
            );
        }

        if (remote.match(/^file\:\/\//)) {
            return getCommittedToUploadedS3CommittedMapFunc(
                { mkdirp, cmdSpawner: CmdRunner.getCmdSpawner({}), rename },
                configDir,
                removeProtocol(remote),
                gpgKey,
                join(bashDir, 'upload-cat')
            );
        }

        throw new Error("NO_REMOTE_PROTOCOL: Cannot figure out where to copy file parts");
    }

    let stdPipeOptions = { objectMode: true, highWaterMark: 1},
        config: ConfigFile = readConfig(configDir),
        gpgKey = config['gpg-key'],
        pendingCommitDir = 'pending-commit',
        s3Bucket = config.remote;

    const quiet = false;

    let commitedToUploadedCommitted = new MapTransform(
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
        );

    getSortedCommitFilenamePipe(configDir, [pendingCommitDir])
        .pipe(preparePipe(commitedToUploadedCommitted))
        .on('finish', () => {
        if (!quiet) {
            console.log("All metadata uploaded, backup complete");
        }
    });
}

export function upload(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {

    const filePartByteCountThreshold = 1024 * 1024 * 64, // 64MB
        commitFileByteCountThreshold = 1024 * 1024 * 256, // 256MB
        commitMaxDelay = 1000 * 60 * 5;

    const quiet = false;

    if (!safeSize(filePartByteCountThreshold)) {
        throw new Error(`The size ${filePartByteCountThreshold} is not a safe size`);
    }

    if (!safeSize(commitFileByteCountThreshold)) {
        throw new Error(`The size ${commitFileByteCountThreshold} is not a safe size`);
    }

    let stdPipeOptions = { objectMode: true, highWaterMark: 1},
        tmpDir = join(configDir, "tmp"),
        commitDir = 'commit',
        remoteCommitDir = 'remote-commit',
        config: ConfigFile = readConfig(configDir),
        clientId = config['client-id'],
        s3Bucket = config.remote,
        gpgKey = config['gpg-key'],
        fpGpgKey = config['filepart-gpg-key'],
        rootReader = new RootReadable(
            {glob: RootReadable.getGlobFunc()},
            rootDir,
            []
        ),
        filenameToFile = new MapTransform(
            getFilenameToFileMapFunc({ stat }, rootDir),
            stdPipeOptions
        ),
        fileToSha256File = new MapTransform(
            getFileToSha256FileMapFunc(
                { runner: getRunner({ cmdSpawner: CmdRunner.getCmdSpawner({}) }) },
                rootDir
            ),
            stdPipeOptions
        ),
        fileToSha256FilePart = new Sha256FileToSha256FilePart(
            rootDir,
            filePartByteCountThreshold,
            stdPipeOptions
        ),
        uploadedS3FilePartsToCommit = new UploadedS3FilePartsToCommit(
            UploadedS3FilePartsToCommit.getDependencies(),
            clientId,
            gpgKey,
            commitFileByteCountThreshold,
            commitMaxDelay,
            {}
        ),
        sha256FilePartToUploadedS3FilePart = new MapTransform(
            getSha256FilePartToUploadedFilePart(
                rootDir,
                config.remote,
                fpGpgKey,
                filePartByteCountThreshold
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
        .pipe(preparePipe(sha256FilePartToUploadedS3FilePart))
        .pipe(preparePipe(uploadedS3FilePartsToCommit))
        .pipe(preparePipe(commitToCommitted));

    backup.on('finish', () => {
        if (!quiet) {
            console.log("Files uploaded to repository, you may now `push` metadata");
        }
    });


}

export function fetch(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {


    let stdPipeOptions = { objectMode: true, highWaterMark: 1},
        cmdSpawner = CmdRunner.getCmdSpawner({}),
        config: ConfigFile = readConfig(configDir),
        remoteType = getRemoteType(config.remote),
        globber = RootReadable.getGlobFunc(),
        repositoryCommitFiles: null|Readable<Filename> = null,
        cmd: string = '';

    const quiet = false;

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
            config['gpg-key'],
            cmd
        ),
        { objectMode: true }
    ));


    repositoryCommitFiles.pipe(toRemoteCommit).on('finish', () => {
        if (!quiet) {
            console.log("All commits fetched, you may now `download`");
        }
    });

}

export function download(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {

    let stdPipeOptions = { objectMode: true, highWaterMark: 1};

    let config: ConfigFile = readConfig(configDir);

    const quiet = false;

    let remoteType = getRemoteType(config.remote);

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

    let toRemotePendingCommitStats = preparePipe(
            new MapTransform(
                getToRemotePendingCommitStatsMapFunc(
                    getToRemotePendingCommitStatsDependencies(),
                    rootDir
                ),
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
        .on('finish', () => {
            if (!quiet) { console.log("All data downloaded"); }
        });


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


