import { BackupCheckDatabase, BackupCheckDatabaseValue, RemotePendingCommitStatDecided, RemoteType, S3BucketName, RemoteUri, GpgKey, UploadedS3FilePart, Sha256FilePart, ConfigFile, AbsoluteDirectoryPath, RelativeFilePath, Filename, CommitFilename } from './Types';
import { format } from 'util';
import { readFileSync, readFile } from 'fs';
import getToRemotePendingCommitStatsMapFunc from './getToRemotePendingCommitStatsMapFunc';
import safeSize from './safeSize';
import getToRemotePendingCommitDeciderMapFunc from './getToRemotePendingCommitDeciderMapFunc';
import DeletedFilenameToCommit from './DeletedFilenameToCommit';
import { getDependencies as getToFileMapFuncDependencies } from './getToFileMapFunc';
import getToFileMapFunc from './getToFileMapFunc';
import managedMultiProgress from 'managed-multi-progress';

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
import { FlattenTransform, RightAfterLeft, FinalDuplex, ScanTransform, SortDuplex, ErrorStream, MapFunc, MapTransform, ParallelJoin } from 'streamdash';
import getLocalCommitFilenameToCommitMapFunc from './getLocalCommitFilenameToCommitMapFunc';
import { getFilenameToFileMapFunc } from './getFilenameToFileMapFunc';
import { getFileToSha256FileMapFunc, getRunner } from './getFileToSha256FileMapFunc';
import { Sha256FileToSha256FilePart } from './Sha256FileToSha256FilePart';
import { getDependencies as getSha256FilePartToUploadedS3FilePartDependencies } from './getSha256FilePartToUploadedS3FilePartMapFunc';
import getSha256FilePartToUploadedS3FilePartMapFunc from './getSha256FilePartToUploadedS3FilePartMapFunc';
import { getCommitToCommittedMapFuncDependencies, getCommitToCommittedMapFunc } from './getCommitToCommittedMapFunc';
import { UploadedS3FilePartsToCommit } from './UploadedS3FilePartsToCommit';
import { Readable, Transform, Writable } from 'stronger-typed-streams';
import getCommittedToUploadedS3CommittedMapFunc from './getCommittedToUploadedCommittedMapFunc';
import { stat } from 'fs';
import getFileNotBackedUpRightAfterLeftMapFunc from './getFileNotBackedUpRightAfterLeftMapFunc';
import getLocallyDeletedFilesRightAfterLeftMapFunc from '../src/getLocallyDeletedFilesRightAfterLeftMapFunc';
// import getRemotePendingCommitToRemotePendingCommitLocalInfoRightAfterLeftMapFunc from './getRemotePendingCommitToRemotePendingCommitLocalInfoRightAfterLeftMapFunc';
import getToRemotePendingCommitInfoRightAfterLeftMapFunc from './getToRemotePendingCommitInfoRightAfterLeftMapFunc';
import { join as joinArray, sortBy, toPairs, map } from 'ramda';
import getRepositoryCommitToRemoteCommitMapFunc from './getRepositoryCommitToRemoteCommitMapFunc';
import { getDependencies as getRepositoryCommitToRemoteCommitMapFuncDependencies } from './getRepositoryCommitToRemoteCommitMapFunc';
import getNotInLeft from './getNotInLeftRightAfterLeftMapFunc';
import { S3 } from 'aws-sdk';


const stdPipeOptions = { objectMode: true, highWaterMark: 1};

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
        this.out(this.name, ob);
        cb();
    }
}


class EndWritable extends Writable<Object> {
    constructor() { super({objectMode: true}); }
    _write(ob, encoding, cb) { cb(); }
}


class Spy<A> extends Transform<A, A> {

    constructor(private onPassedThrough, opts) {
        super(opts);
    }

    _transform(a, encoding, cb) {
        this.push(a);
        try {
        this.onPassedThrough(a);
        } catch (e) {
            return cb(e);
        }
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
    errorOut = new ConsoleWritable(
        { out: (n, o) => { console.log(`${n}: ${JSON.stringify(o)}`); }},
        "Error: "
    ),
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

function getSha256FilePartToUploadedFilePart(configDir: AbsoluteDirectoryPath, rootDir: AbsoluteDirectoryPath, remote: RemoteUri, gpgKey: GpgKey, filePartByteCountThreshold: number): MapFunc<Sha256FilePart, UploadedS3FilePart> {

    if (remote.match(/^s3\:\/\//)) {
        return getSha256FilePartToUploadedS3FilePartMapFunc(
            getSha256FilePartToUploadedS3FilePartDependencies(RemoteType.S3),
            configDir,
            rootDir,
            removeProtocol(remote),
            gpgKey,
            filePartByteCountThreshold,
        );
    }

    if (remote.match(/^file\:\/\//)) {
        return getSha256FilePartToUploadedS3FilePartMapFunc(
            getSha256FilePartToUploadedS3FilePartDependencies(RemoteType.LOCAL_FILES),
            configDir,
            rootDir,
            removeProtocol(remote),
            gpgKey,
            filePartByteCountThreshold,
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

export function push(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath, { quiet }) {

    function getCommittedToUploadedCommittedMapFunc(configDir: AbsoluteDirectoryPath, remote: RemoteUri, gpgKey: GpgKey) {

        if (remote.match(/^s3\:\/\//)) {
            return getCommittedToUploadedS3CommittedMapFunc(
                getCommittedToUploadedS3CommittedMapFunc.getDependencies(
                    getRemoteType(config.remote),
                ),
                configDir,
                removeProtocol(remote),
                gpgKey,
                join(bashDir, 'upload-s3')
            );
        }

        if (remote.match(/^file\:\/\//)) {
            return getCommittedToUploadedS3CommittedMapFunc(
                getCommittedToUploadedS3CommittedMapFunc.getDependencies(
                    getRemoteType(config.remote),
                ),
                configDir,
                removeProtocol(remote),
                gpgKey,
                join(bashDir, 'upload-cat')
            );
        }

        throw new Error("NO_REMOTE_PROTOCOL: Cannot figure out where to copy file parts");
    }

    let config: ConfigFile = readConfig(configDir),
        gpgKey = config['gpg-key'],
        pendingCommitDir = 'pending-commit',
        s3Bucket = config.remote;

    let commitedToUploadedCommitted = new MapTransform(
            getCommittedToUploadedCommittedMapFunc(
                configDir,
                s3Bucket,
                gpgKey,
            ),
            {objectMode: true}
        );

    getSortedCommitFilenamePipe(configDir, [pendingCommitDir])
        .pipe(preparePipe(commitedToUploadedCommitted))
        .pipe(preparePipe(new EndWritable()))
        .on('finish', () => {
            if (!quiet) {
                console.log("All metadata uploaded, backup complete");
            }
        });
}

function getNotBackedUp(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {
    let commitDir = 'commit',
        remoteCommitDir = 'remote-commit',
        pendingCommitDir = 'pending-commit';


    let fileNotBackedUpRightAfterLeft = new RightAfterLeft(
            getFileNotBackedUpRightAfterLeftMapFunc({}),
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
            stdPipeOptions
        ),
        rootReader = new RootReadable(
            {glob: RootReadable.getGlobFunc()},
            rootDir,
            []
        ),
        filenameToFile = new MapTransform(
            getFilenameToFileMapFunc({ stat }, rootDir),
            stdPipeOptions
        ),
        backupCheckDatabaseFinal = new FinalDuplex({objectMode: true});


    getSortedCommitFilenamePipe(configDir, [pendingCommitDir, commitDir, remoteCommitDir])
        .pipe(preparePipe(localCommitFileToCommit))
        .pipe(preparePipe(commitToBackupCheckDatabase))
        .pipe(preparePipe(backupCheckDatabaseFinal))
        .pipe(preparePipe(fileNotBackedUpRightAfterLeft.left));


    preparePipe(rootReader)
        .pipe(preparePipe(filenameToFile))
        .pipe(preparePipe(fileNotBackedUpRightAfterLeft.right));

    return fileNotBackedUpRightAfterLeft;

}

export function listUpload(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {


    getNotBackedUp(rootDir, configDir)
        .pipe(new ConsoleWritable(
            { out: (n, o) => { console.log(`${o.path}`); }},
            "Error: "
        ));
}

interface OverallBar {
    plus: Spy<any & Filename>;
    minus: Spy<any & Filename>;
}


function getProgressBarTitle(path, useStartForTitle = true) {
    const progressBarTitleLength = 42;
    return (path.length <= progressBarTitleLength) ?
        path :
        useStartForTitle ?
            (path.substr(0, progressBarTitleLength) + '...') :
            ('...' + path.substr(path.length - progressBarTitleLength));
}

function getOverallBar(barUpdater, quiet, useStartForTitle = true): OverallBar {
    let totalItems = 0,
        currentItem = 0,
        currentTitle = 'Overall';

    let plus = new Spy(
        (a) => {
            if (!quiet) {
                barUpdater({
                    id: "main",
                    total: totalItems += 1,
                    current: currentItem,
                    params: { total: totalItems, title: currentTitle }
                });
            }
        },
        { highWaterMark: 999999, objectMode: true }
    );
    let minus = new Spy(
        (a) => {
            if (!quiet) {
                let p = "Overall";
                if (a && a.commitId) {
                    p = getProgressBarTitle(a.commitId, useStartForTitle);
                }
                if (a && a.path && a.path.substr) {
                    p = getProgressBarTitle(a.path, useStartForTitle);
                }
                currentTitle = "Finished: " + p;
                barUpdater({
                    id: "main",
                    total: totalItems,
                    current: currentItem += 1,
                    params: { current: currentItem, title: currentTitle }
                });
            }
        },
        { highWaterMark: 1, objectMode: true }
    );

    return { minus, plus };
}

function getThresholds() {
    if (process.env.hasOwnProperty('BINARY_REPOSITORY_USE_DEV_THRESHOLDS')) {
        return {
            filePartByteCountThreshold: 1024, // 1K
            commitFileByteCountThreshold: 1024, // 1K
            commitMaxTimeThreshold: 1000 * 60
        };
    }
    return {
        filePartByteCountThreshold: 1024 * 1024 * 64, // 64MB
        commitFileByteCountThreshold: 1024 * 1024 * 256, // 256MB
        commitMaxTimeThreshold: 1000 * 60 * 15 // 15 mins
    };
}

export function upload(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath, { quiet }) {

    const {
        filePartByteCountThreshold,
        commitFileByteCountThreshold,
        commitMaxTimeThreshold
    } = getThresholds();

    let barUpdater = managedMultiProgress(
        5,
        {
            current: 0,
            total: 0,
            format: '[:bar] :current/:total - :title',
            id: 'main',
            width: 9,
            complete: '#',
            incomplete: '-',
        },
        {
            total: 3,
            width: 9,
            format: '[:bar] :current/:total - :title',
        }
    );

    if (!safeSize(filePartByteCountThreshold)) {
        throw new Error(`The size ${filePartByteCountThreshold} is not a safe size`);
    }

    if (!safeSize(commitFileByteCountThreshold)) {
        throw new Error(`The size ${commitFileByteCountThreshold} is not a safe size`);
    }

    let config: ConfigFile = readConfig(configDir),
        clientId = config['client-id'],
        gpgKey = config['gpg-key'],
        fpGpgKey = config['filepart-gpg-key'],
        fileToSha256File = new MapTransform(
            getFileToSha256FileMapFunc(
                { runner: getRunner() },
                rootDir
            ),
            stdPipeOptions
        ),
        fileToSha256FilePart = new Sha256FileToSha256FilePart(
            filePartByteCountThreshold,
            stdPipeOptions
        ),
        uploadedS3FilePartsToCommit = new UploadedS3FilePartsToCommit(
            UploadedS3FilePartsToCommit.getDependencies(),
            clientId,
            gpgKey,
            commitFileByteCountThreshold,
            commitMaxTimeThreshold,
            stdPipeOptions
        ),
        sha256FilePartToUploadedS3FilePart = new MapTransform(
            getSha256FilePartToUploadedFilePart(
                configDir,
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
        );

    function getFileSpy(t, n) {
        return new Spy(
            (a) => {
                if (!a.path) {
                    throw new Error("getFileSpy: Everything should derive from Filename");
                }
                if (!quiet) {
                    barUpdater({
                        id: a.path,
                        current: n,
                        params: { title: format(t, getProgressBarTitle(a.path, false)) }
                    });
                }
            },
            stdPipeOptions
        );
    }

    let overallBar = getOverallBar(barUpdater, quiet);

    getNotBackedUp(rootDir, configDir)
        .pipe(overallBar.plus)
        .pipe(getFileSpy("%s: SHA summing...", 1))
        .pipe(preparePipe(fileToSha256File))
        .pipe(preparePipe(fileToSha256FilePart))
        .pipe(getFileSpy("%s: Uploading...", 2))
        .pipe(preparePipe(sha256FilePartToUploadedS3FilePart))
        .pipe(getFileSpy("%s: Committing...", 3))
        .pipe(overallBar.minus)
        .pipe(preparePipe(uploadedS3FilePartsToCommit))
        .pipe(preparePipe(commitToCommitted))
        .pipe(preparePipe(new EndWritable()))
        .on('finish', () => {
            if (!quiet) {
                barUpdater.terminate(
                    "Files uploaded to repository, you may now `push` metadata"
                );
            }
        });


}

export function fetch(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath, { quiet }) {


    let config: ConfigFile = readConfig(configDir),
        remoteType = getRemoteType(config.remote),
        globber = RootReadable.getGlobFunc(),
        repositoryCommitFiles: null|Readable<Filename> = null,
        commitDir = 'commit',
        remoteCommitDir = 'remote-commit',
        remotePendingCommitDir = 'remote-pending-commit',
        pendingCommitDir = 'pending-commit';

    let barUpdater = managedMultiProgress(
            5,
            {
                current: 0,
                total: 0,
                format: '[:bar] :current/:total - :title',
                id: 'main',
                width: 9,
                complete: '#',
                incomplete: '-',
            },
            {
                total: 3,
                width: 9,
                format: '[:bar] :current/:total - :title',
            }
        ),
        overallBar = getOverallBar(barUpdater, quiet);


    if (remoteType == RemoteType.LOCAL_FILES) {
        repositoryCommitFiles = preparePipe(new CommitFilenameLocalFiles(
            {glob: globber},
            removeProtocol(config['remote']),
            { objectMode: true }
        ));
    }


    if (remoteType == RemoteType.S3) {
        repositoryCommitFiles = preparePipe(new CommitFilenameS3(
            new S3(),
            removeProtocol(config['remote']),
            { objectMode: true }
        ));
    }

    if (repositoryCommitFiles === null) {
        throw new Error("Could not identify repository type");
    }

    let existingCommitFilename = getSortedCommitFilenamePipe(configDir, [pendingCommitDir, commitDir, remoteCommitDir, remotePendingCommitDir]);
    let notInLeft = new RightAfterLeft(getNotInLeft({}), stdPipeOptions);

    existingCommitFilename.pipe(notInLeft.left);
    repositoryCommitFiles.pipe(notInLeft.right);

    let toRemoteCommit = preparePipe(new MapTransform(
        getRepositoryCommitToRemoteCommitMapFunc(
            getRepositoryCommitToRemoteCommitMapFuncDependencies(remoteType),
            configDir,
            removeProtocol(config['remote']),
            config['gpg-key']
        ),
        { objectMode: true }
    ));

    // console.log("Must check what is already downloaded + integration test");
    // process.exit(1);

    notInLeft
        .pipe(overallBar.plus)
        .pipe(toRemoteCommit)
        .pipe(overallBar.minus)
        .pipe(preparePipe(new EndWritable()))
        .on('finish', () => {
            if (!quiet) {
                barUpdater.terminate(
                    "All commits fetched, you may now `download`"
                );
            }
        });

}

function getCommitStream(configDir: AbsoluteDirectoryPath, subDirs: string[]) {

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


export function listDownloadImpl(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {

    let remotePendingCommitStream = getCommitStream(
        configDir,
        ['remote-pending-commit'],
    );

    let processedCommitStream = getCommitStream(
            configDir,
            ['commit', 'remote-commit'],
        );

    let toBackupCheckDatabaseScan = preparePipe(new ScanTransform(
            getCommitToBackupCheckDatabaseScanFunc({}),
            {},
            stdPipeOptions
        ));

    let toBackupCheckDatabaseFinal = preparePipe(new FinalDuplex(stdPipeOptions));

    let backupCheckDatabaseFinal = processedCommitStream
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

    remotePendingCommitStream.pipe(remotePendingCommitLocalInfoStream.right);
    backupCheckDatabaseFinal.pipe(remotePendingCommitLocalInfoStream.left);

    let toRemotePendingCommitDecider = preparePipe(
        new MapTransform(
            getToRemotePendingCommitDeciderMapFunc({}),
            stdPipeOptions
        )
    );

    return remotePendingCommitLocalInfoStream.pipe(toRemotePendingCommitStats)
        .pipe(toRemotePendingCommitDecider);

}

export function listExisting(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath, { detail }) {

    let commitStream = getCommitStream(
        configDir,
        ['commit', 'remote-commit']
    );
    let toBackupCheckDatabaseScan = preparePipe(new ScanTransform(
        getCommitToBackupCheckDatabaseScanFunc({}),
        {},
        stdPipeOptions
    ));

    commitStream
        .pipe(toBackupCheckDatabaseScan)
        .pipe(new FinalDuplex(stdPipeOptions))
        .pipe(new ConsoleWritable(
            { out: (n, o: BackupCheckDatabase) => {
                let outs = map(
                    ([k, vs]: [string, BackupCheckDatabaseValue[]]) => {
                        if (!detail) { return k; }
                        let outV = joinArray(" ", map(v => v.commitId, vs));
                        return `${k} (${outV})`;
                    },
                    sortBy(([k1, v1]) => k1, toPairs(o))
                );
                console.log(joinArray("\n", outs));
                // let r = joinArray("\n", sortBy(a => a, keys(o)));
                // if (detail) {

                // }
                // console.log(r);
            } },
            "Error: "
        ));
}

export function listDownload(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {

    function toFileListScanFunc(acc: string[], a: RemotePendingCommitStatDecided, next): void {
        let cPaths = a.record.filter(rec => { return rec.proceed }).map(rec => rec.path);
        next(null, acc.concat(cPaths));
    };

    let viewTransform = new ScanTransform(
        toFileListScanFunc,
        <string[]>[],
        { objectMode: true, highWaterMark: 1}
    );
    ;

    listDownloadImpl(rootDir, configDir)
        .pipe(viewTransform)
        .pipe(new FinalDuplex(stdPipeOptions))
        .pipe(new FlattenTransform({objectMode: true}))
        .pipe(new ConsoleWritable(
            { out: (n, o) => { console.log(`${o}`); }},
            "Error: "
        ));
}

export function download(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath, { quiet }) {

    let config: ConfigFile = readConfig(configDir);
    let remoteType = getRemoteType(config.remote);

    let barUpdater = managedMultiProgress(
        9,
        {
            current: 0,
            total: 0,
            format: '[:bar] :current/:total - :title',
            id: 'main',
            width: 9,
            complete: '#',
            incomplete: '-',
        },
        {
            total: 9,
            width: 9,
            format: '[:bar] :current/:total - :title',
        }
    );

    let overallBar = getOverallBar(barUpdater, quiet, true);

    function notificationHandler(id, status) {
        if (quiet) { return; }
        let statuses = {
            Analyzing: 1,
            Downloading: 2,
            Skipping: 3,
            Downloaded: 4,
            Decrypting: 5,
            Deleting: 5,
            Decrypted: 6,
            Copying: 7,
            Copied: 8,
            Finished: 9,
            Deleted: 9,
        }
        if (!statuses.hasOwnProperty(status)) {
            throw new Error("notificationHandler: Could not find status '" + status + "'");
        }
        let d = {
            id,
            current: statuses[status],
            params: { title: `${status}: ${getProgressBarTitle(id, false)}` }
        }
        barUpdater(d);
    }

    let toDownloadedParts = preparePipe(new MapTransform(
        getToDownloadedPartsMapFunc(
            getToDownloadedPartsMapFuncDependencies(remoteType),
            configDir,
            removeProtocol(config.remote),
            notificationHandler
        ),
        stdPipeOptions
    ));

    let toFile = preparePipe(new MapTransform(
        getToFileMapFunc(
            getToFileMapFuncDependencies(),
            configDir,
            rootDir,
            notificationHandler
        ),
        stdPipeOptions
    ));

    listDownloadImpl(rootDir, configDir)
        .pipe(overallBar.plus)
        .pipe(toDownloadedParts)
        .pipe(toFile)
        .pipe(overallBar.minus)
        .pipe(preparePipe(new EndWritable()))
        .on('finish', () => {
            if (!quiet) {
                barUpdater.terminate("All data downloaded");
            }
        });

}

function deletedFileList(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {

    let commitDir = 'commit',
        remoteCommitDir = 'remote-commit',
        pendingCommitDir = 'pending-commit';

    let rootReader = new RootReadable(
            {glob: RootReadable.getGlobFunc()},
            rootDir,
            []
        ),
        filenameToFile = new MapTransform(
            getFilenameToFileMapFunc({ stat }, rootDir),
            stdPipeOptions
        );

    let commitFilenames = getSortedCommitFilenamePipe(
            configDir,
            [pendingCommitDir, commitDir, remoteCommitDir]
        ),
        commitFilenameToCommit = new MapTransform(
            getLocalCommitFilenameToCommitMapFunc(
                { readFile },
                configDir
            ),
            stdPipeOptions
        );

    let locallyDeletedFilesRightAfterLeft = preparePipe(new RightAfterLeft(
            getLocallyDeletedFilesRightAfterLeftMapFunc({}),
            stdPipeOptions
        ));

    preparePipe(rootReader)
        .pipe(preparePipe(filenameToFile))
        .pipe(preparePipe(locallyDeletedFilesRightAfterLeft.right));

    commitFilenames.pipe(preparePipe(commitFilenameToCommit))
        .pipe(preparePipe(locallyDeletedFilesRightAfterLeft.left));

    return locallyDeletedFilesRightAfterLeft;
}

export function listMarkDeleted(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {

    let lister = deletedFileList(rootDir, configDir);

    lister.pipe(new ConsoleWritable(
        { out: (n, o) => { console.log(`${o.path}`); }},
        "Error: "
    ));


}

export function markDeleted(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath, { quiet }) {

    let lister = deletedFileList(rootDir, configDir),
        { commitFileByteCountThreshold } = getThresholds(),
        config: ConfigFile = readConfig(configDir),
        clientId = config['client-id'],
        gpgKey = config['gpg-key'],
        deletedCommit = new DeletedFilenameToCommit(
            DeletedFilenameToCommit.getDependencies(),
            clientId,
            gpgKey,
            commitFileByteCountThreshold,
            stdPipeOptions
        ),
        commitToCommitted = new MapTransform(
            getCommitToCommittedMapFunc(
                getCommitToCommittedMapFuncDependencies(),
                configDir
            ),
            stdPipeOptions
        );

        lister
            .pipe(deletedCommit)
            .pipe(commitToCommitted)
            .on('finish', () => {
                if (!quiet) {
                    console.log("Marked Deleted");
                }
            });
}
