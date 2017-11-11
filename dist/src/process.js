"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const util_1 = require("util");
const fs_1 = require("fs");
const getToRemotePendingCommitStatsMapFunc_1 = require("./getToRemotePendingCommitStatsMapFunc");
const safeSize_1 = require("./safeSize");
const getToRemotePendingCommitDeciderMapFunc_1 = require("./getToRemotePendingCommitDeciderMapFunc");
const getToFileMapFunc_1 = require("./getToFileMapFunc");
const getToFileMapFunc_2 = require("./getToFileMapFunc");
const managed_multi_progress_1 = require("managed-multi-progress");
const getToDownloadedPartsMapFunc_1 = require("./getToDownloadedPartsMapFunc");
const getToDownloadedPartsMapFunc_2 = require("./getToDownloadedPartsMapFunc");
const getToRemotePendingCommitStatsMapFunc_2 = require("./getToRemotePendingCommitStatsMapFunc");
const getCommitToBackupCheckDatabaseScanFunc_1 = require("./getCommitToBackupCheckDatabaseScanFunc");
const CommitFilenameLocalFiles_1 = require("./CommitFilenameLocalFiles");
const CommitFilenameS3_1 = require("./CommitFilenameS3");
const RootReadable_1 = require("./RootReadable");
const path_1 = require("path");
const commitFilenameSorter_1 = require("./commitFilenameSorter");
const getMergeInCommitType_1 = require("./getMergeInCommitType");
const streamdash_1 = require("streamdash");
const getLocalCommitFilenameToCommitMapFunc_1 = require("./getLocalCommitFilenameToCommitMapFunc");
const getFilenameToFileMapFunc_1 = require("./getFilenameToFileMapFunc");
const getFileToSha256FileMapFunc_1 = require("./getFileToSha256FileMapFunc");
const Sha256FileToSha256FilePart_1 = require("./Sha256FileToSha256FilePart");
const getSha256FilePartToUploadedS3FilePartMapFunc_1 = require("./getSha256FilePartToUploadedS3FilePartMapFunc");
const getSha256FilePartToUploadedS3FilePartMapFunc_2 = require("./getSha256FilePartToUploadedS3FilePartMapFunc");
const getCommitToCommittedMapFunc_1 = require("./getCommitToCommittedMapFunc");
const UploadedS3FilePartsToCommit_1 = require("./UploadedS3FilePartsToCommit");
const stronger_typed_streams_1 = require("stronger-typed-streams");
const CmdRunner_1 = require("./CmdRunner");
const getCommittedToUploadedCommittedMapFunc_1 = require("./getCommittedToUploadedCommittedMapFunc");
const fs_2 = require("fs");
const getFileNotBackedUpRightAfterLeftMapFunc_1 = require("./getFileNotBackedUpRightAfterLeftMapFunc");
// import getRemotePendingCommitToRemotePendingCommitLocalInfoRightAfterLeftMapFunc from './getRemotePendingCommitToRemotePendingCommitLocalInfoRightAfterLeftMapFunc';
const getToRemotePendingCommitInfoRightAfterLeftMapFunc_1 = require("./getToRemotePendingCommitInfoRightAfterLeftMapFunc");
const ramda_1 = require("ramda");
const getRepositoryCommitToRemoteCommitMapFunc_1 = require("./getRepositoryCommitToRemoteCommitMapFunc");
const getNotInLeftRightAfterLeftMapFunc_1 = require("./getNotInLeftRightAfterLeftMapFunc");
const mkdirp = require("mkdirp");
const aws_sdk_1 = require("aws-sdk");
const stdPipeOptions = { objectMode: true, highWaterMark: 1 };
const bashDir = path_1.join(path_1.dirname(path_1.dirname(__dirname)), 'bash');
class ConsoleWritable extends stronger_typed_streams_1.Writable {
    constructor({ out }, name) {
        super({ objectMode: true });
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
class EndWritable extends stronger_typed_streams_1.Writable {
    constructor() { super({ objectMode: true }); }
    _write(ob, encoding, cb) { cb(); }
}
class Spy extends stronger_typed_streams_1.Transform {
    constructor(onPassedThrough, opts) {
        super(opts);
        this.onPassedThrough = onPassedThrough;
    }
    _transform(a, encoding, cb) {
        this.push(a);
        try {
            this.onPassedThrough(a);
        }
        catch (e) {
            return cb(e);
        }
        cb();
    }
}
function getPreparePipe(es) {
    return (p) => {
        es.add(p);
        p.on('error', (e) => {
            throw e;
        });
        return p;
    };
}
let errorStream = new streamdash_1.ErrorStream({ objectMode: true }), errorOut = new ConsoleWritable({ out: (n, o) => { console.log(`${n}: ${JSON.stringify(o)}`); } }, "Error: "), preparePipe = getPreparePipe(errorStream);
errorStream.pipe(errorOut);
function getSortedCommitFilenamePipe(rootDir, dirs) {
    let globber = RootReadable_1.RootReadable.getGlobFunc();
    let strms = dirs.map((d) => {
        let s = new RootReadable_1.RootReadable({ glob: globber }, path_1.join(rootDir, d), []);
        let t = new streamdash_1.MapTransform(getMergeInCommitType_1.getMergeInCommitType({ commitType: d }), { objectMode: true });
        return preparePipe(s.pipe(t));
    });
    // TODO: Cannot pipe multile items into one. Look at creating a JoinDuplex
    let commitSorter = new streamdash_1.SortDuplex(commitFilenameSorter_1.default, { objectMode: true });
    let pjoin = new streamdash_1.ParallelJoin({ objectMode: true });
    strms.forEach(s => {
        s.pipe(pjoin.add({ objectMode: true }));
    });
    pjoin.pipe(commitSorter);
    return preparePipe(commitSorter);
}
function removeProtocol(s) {
    return s.replace(/^[a-z0-9]+\:\/\//, '');
}
function getRemoteType(remote) {
    if (remote.match(/^s3\:\/\//)) {
        return Types_1.RemoteType.S3;
    }
    if (remote.match(/^file\:\/\//)) {
        return Types_1.RemoteType.LOCAL_FILES;
    }
    throw new Error("Cannot figure out remote type from RemoteUri: " + remote);
}
function getSha256FilePartToUploadedFilePart(rootDir, remote, gpgKey, filePartByteCountThreshold) {
    if (remote.match(/^s3\:\/\//)) {
        return getSha256FilePartToUploadedS3FilePartMapFunc_2.default(getSha256FilePartToUploadedS3FilePartMapFunc_1.getDependencies(Types_1.RemoteType.S3), rootDir, removeProtocol(remote), gpgKey, filePartByteCountThreshold, path_1.join(bashDir, 'upload-s3'));
    }
    if (remote.match(/^file\:\/\//)) {
        return getSha256FilePartToUploadedS3FilePartMapFunc_2.default(getSha256FilePartToUploadedS3FilePartMapFunc_1.getDependencies(Types_1.RemoteType.LOCAL_FILES), rootDir, removeProtocol(remote), gpgKey, filePartByteCountThreshold, path_1.join(bashDir, 'upload-cat'));
    }
    throw new Error("NO_REMOTE_PROTOCOL: Cannot figure out where to copy file parts");
}
function readConfig(configDir) {
    let cf = path_1.join(configDir, 'config');
    try {
        return JSON.parse(fs_1.readFileSync(cf, { encoding: 'utf8' }));
    }
    catch (e) {
        throw new Error(`Config file '${cf}' does not appear to be ` +
            `valid JSON`);
    }
}
function push(rootDir, configDir, { quiet }) {
    function getCommittedToUploadedCommittedMapFunc(configDir, remote, gpgKey) {
        if (remote.match(/^s3\:\/\//)) {
            return getCommittedToUploadedCommittedMapFunc_1.default({ mkdirp, cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({}), rename: fs_1.rename }, configDir, removeProtocol(remote), gpgKey, path_1.join(bashDir, 'upload-s3'));
        }
        if (remote.match(/^file\:\/\//)) {
            return getCommittedToUploadedCommittedMapFunc_1.default({ mkdirp, cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({}), rename: fs_1.rename }, configDir, removeProtocol(remote), gpgKey, path_1.join(bashDir, 'upload-cat'));
        }
        throw new Error("NO_REMOTE_PROTOCOL: Cannot figure out where to copy file parts");
    }
    let config = readConfig(configDir), gpgKey = config['gpg-key'], pendingCommitDir = 'pending-commit', s3Bucket = config.remote;
    let commitedToUploadedCommitted = new streamdash_1.MapTransform(getCommittedToUploadedCommittedMapFunc(configDir, s3Bucket, gpgKey), { objectMode: true });
    getSortedCommitFilenamePipe(configDir, [pendingCommitDir])
        .pipe(preparePipe(commitedToUploadedCommitted))
        .pipe(preparePipe(new EndWritable()))
        .on('finish', () => {
        if (!quiet) {
            console.log("All metadata uploaded, backup complete");
        }
    });
}
exports.push = push;
function getNotBackedUp(rootDir, configDir) {
    let commitDir = 'commit', remoteCommitDir = 'remote-commit', pendingCommitDir = 'pending-commit';
    let fileNotBackedUpRightAfterLeft = new streamdash_1.RightAfterLeft(getFileNotBackedUpRightAfterLeftMapFunc_1.default({}), stdPipeOptions), localCommitFileToCommit = new streamdash_1.MapTransform(getLocalCommitFilenameToCommitMapFunc_1.default({ readFile: fs_1.readFile }, configDir), stdPipeOptions), commitToBackupCheckDatabase = new streamdash_1.ScanTransform(getCommitToBackupCheckDatabaseScanFunc_1.default({}), {}, stdPipeOptions), rootReader = new RootReadable_1.RootReadable({ glob: RootReadable_1.RootReadable.getGlobFunc() }, rootDir, []), filenameToFile = new streamdash_1.MapTransform(getFilenameToFileMapFunc_1.getFilenameToFileMapFunc({ stat: fs_2.stat }, rootDir), stdPipeOptions), backupCheckDatabaseFinal = new streamdash_1.FinalDuplex({ objectMode: true });
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
function listUpload(rootDir, configDir) {
    getNotBackedUp(rootDir, configDir)
        .pipe(new ConsoleWritable({ out: (n, o) => { console.log(`${o.path}`); } }, "Error: "));
}
exports.listUpload = listUpload;
function getProgressBarTitle(path, useStartForTitle = true) {
    const progressBarTitleLength = 42;
    return (path.length <= progressBarTitleLength) ?
        path :
        useStartForTitle ?
            (path.substr(0, progressBarTitleLength) + '...') :
            ('...' + path.substr(path.length - progressBarTitleLength));
}
function getOverallBar(barUpdater, quiet, useStartForTitle = true) {
    let totalItems = 0, currentItem = 0, currentTitle = 'Overall';
    let plus = new Spy((a) => {
        if (!quiet) {
            barUpdater({
                id: "main",
                total: totalItems += 1,
                current: currentItem,
                params: { total: totalItems, title: currentTitle }
            });
        }
    }, { highWaterMark: 999999, objectMode: true });
    let minus = new Spy((a) => {
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
    }, { highWaterMark: 1, objectMode: true });
    return { minus, plus };
}
function upload(rootDir, configDir, { quiet }) {
    const filePartByteCountThreshold = 1024 * 1024 * 64, // 64MB
    commitFileByteCountThreshold = 1024 * 1024 * 256, // 256MB
    commitMaxDelay = 1000 * 60 * 5;
    let barUpdater = managed_multi_progress_1.default(5, {
        current: 0,
        total: 0,
        format: '[:bar] :current/:total - :title',
        id: 'main',
        width: 9,
        complete: '#',
        incomplete: '-',
    }, {
        total: 3,
        width: 9,
        format: '[:bar] :current/:total - :title',
    });
    if (!safeSize_1.default(filePartByteCountThreshold)) {
        throw new Error(`The size ${filePartByteCountThreshold} is not a safe size`);
    }
    if (!safeSize_1.default(commitFileByteCountThreshold)) {
        throw new Error(`The size ${commitFileByteCountThreshold} is not a safe size`);
    }
    let config = readConfig(configDir), clientId = config['client-id'], gpgKey = config['gpg-key'], fpGpgKey = config['filepart-gpg-key'], fileToSha256File = new streamdash_1.MapTransform(getFileToSha256FileMapFunc_1.getFileToSha256FileMapFunc({ runner: getFileToSha256FileMapFunc_1.getRunner({ cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({}) }) }, rootDir), stdPipeOptions), fileToSha256FilePart = new Sha256FileToSha256FilePart_1.Sha256FileToSha256FilePart(filePartByteCountThreshold, stdPipeOptions), uploadedS3FilePartsToCommit = new UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit(UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit.getDependencies(), clientId, gpgKey, commitFileByteCountThreshold, commitMaxDelay, stdPipeOptions), sha256FilePartToUploadedS3FilePart = new streamdash_1.MapTransform(getSha256FilePartToUploadedFilePart(rootDir, config.remote, fpGpgKey, filePartByteCountThreshold), stdPipeOptions), commitToCommitted = new streamdash_1.MapTransform(getCommitToCommittedMapFunc_1.getCommitToCommittedMapFunc(getCommitToCommittedMapFunc_1.getCommitToCommittedMapFuncDependencies(), configDir), stdPipeOptions);
    function getFileSpy(t, n) {
        return new Spy((a) => {
            if (!a.path) {
                throw new Error("getFileSpy: Everything should derive from Filename");
            }
            if (!quiet) {
                barUpdater({
                    id: a.path,
                    current: n,
                    params: { title: util_1.format(t, getProgressBarTitle(a.path, false)) }
                });
            }
        }, stdPipeOptions);
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
            barUpdater.terminate("Files uploaded to repository, you may now `push` metadata");
        }
    });
}
exports.upload = upload;
function fetch(rootDir, configDir, { quiet }) {
    let cmdSpawner = CmdRunner_1.CmdRunner.getCmdSpawner({}), config = readConfig(configDir), remoteType = getRemoteType(config.remote), globber = RootReadable_1.RootReadable.getGlobFunc(), repositoryCommitFiles = null, cmd = '', commitDir = 'commit', remoteCommitDir = 'remote-commit', pendingCommitDir = 'pending-commit';
    let barUpdater = managed_multi_progress_1.default(5, {
        current: 0,
        total: 0,
        format: '[:bar] :current/:total - :title',
        id: 'main',
        width: 9,
        complete: '#',
        incomplete: '-',
    }, {
        total: 3,
        width: 9,
        format: '[:bar] :current/:total - :title',
    }), overallBar = getOverallBar(barUpdater, quiet);
    if (remoteType == Types_1.RemoteType.LOCAL_FILES) {
        cmd = path_1.join(bashDir, 'download-cat');
        repositoryCommitFiles = preparePipe(new CommitFilenameLocalFiles_1.default({ glob: globber }, removeProtocol(config['remote']), { objectMode: true }));
    }
    if (remoteType == Types_1.RemoteType.S3) {
        cmd = path_1.join(bashDir, 'download-s3');
        repositoryCommitFiles = preparePipe(new CommitFilenameS3_1.default(new aws_sdk_1.S3(), removeProtocol(config['remote']), { objectMode: true }));
    }
    if (repositoryCommitFiles === null) {
        throw new Error("Could not identify repository type");
    }
    let existingCommitFilename = getSortedCommitFilenamePipe(configDir, [pendingCommitDir, commitDir, remoteCommitDir]);
    let notInLeft = new streamdash_1.RightAfterLeft(getNotInLeftRightAfterLeftMapFunc_1.default({}), stdPipeOptions);
    existingCommitFilename.pipe(notInLeft.left);
    repositoryCommitFiles.pipe(notInLeft.right);
    let toRemoteCommit = preparePipe(new streamdash_1.MapTransform(getRepositoryCommitToRemoteCommitMapFunc_1.default({ cmdSpawner: cmdSpawner, rename: fs_1.rename, mkdirp }, configDir, removeProtocol(config['remote']), config['gpg-key'], cmd), { objectMode: true }));
    // console.log("Must check what is already downloaded + integration test");
    // process.exit(1);
    notInLeft
        .pipe(overallBar.plus)
        .pipe(toRemoteCommit)
        .pipe(overallBar.minus)
        .pipe(preparePipe(new EndWritable()))
        .on('finish', () => {
        if (!quiet) {
            barUpdater.terminate("All commits fetched, you may now `download`");
        }
    });
}
exports.fetch = fetch;
function getCommitStream(configDir, subDirs) {
    let sortedPendingCommitFilenameStream = getSortedCommitFilenamePipe(configDir, subDirs);
    let toCommitStream = preparePipe(new streamdash_1.MapTransform(getLocalCommitFilenameToCommitMapFunc_1.default({ readFile: fs_1.readFile }, configDir), stdPipeOptions));
    return sortedPendingCommitFilenameStream
        .pipe(toCommitStream);
}
function listDownloadImpl(rootDir, configDir) {
    let remotePendingCommitStream = getCommitStream(configDir, ['remote-pending-commit']);
    let processedCommitStream = getCommitStream(configDir, ['commit', 'remote-commit']);
    let toBackupCheckDatabaseScan = preparePipe(new streamdash_1.ScanTransform(getCommitToBackupCheckDatabaseScanFunc_1.default({}), {}, stdPipeOptions));
    let toBackupCheckDatabaseFinal = preparePipe(new streamdash_1.FinalDuplex(stdPipeOptions));
    let backupCheckDatabaseFinal = processedCommitStream
        .pipe(toBackupCheckDatabaseScan)
        .pipe(toBackupCheckDatabaseFinal);
    let remotePendingCommitLocalInfoStream = preparePipe(new streamdash_1.RightAfterLeft(getToRemotePendingCommitInfoRightAfterLeftMapFunc_1.default({}), stdPipeOptions));
    let toRemotePendingCommitStats = preparePipe(new streamdash_1.MapTransform(getToRemotePendingCommitStatsMapFunc_1.default(getToRemotePendingCommitStatsMapFunc_2.getDependencies(), rootDir), stdPipeOptions));
    remotePendingCommitStream.pipe(remotePendingCommitLocalInfoStream.right);
    backupCheckDatabaseFinal.pipe(remotePendingCommitLocalInfoStream.left);
    let toRemotePendingCommitDecider = preparePipe(new streamdash_1.MapTransform(getToRemotePendingCommitDeciderMapFunc_1.default({}), stdPipeOptions));
    return remotePendingCommitLocalInfoStream.pipe(toRemotePendingCommitStats)
        .pipe(toRemotePendingCommitDecider);
}
exports.listDownloadImpl = listDownloadImpl;
function listExisting(rootDir, configDir) {
    let commitStream = getCommitStream(configDir, ['commit', 'remote-commit']);
    let toBackupCheckDatabaseScan = preparePipe(new streamdash_1.ScanTransform(getCommitToBackupCheckDatabaseScanFunc_1.default({}), {}, stdPipeOptions));
    commitStream
        .pipe(toBackupCheckDatabaseScan)
        .pipe(new streamdash_1.FinalDuplex(stdPipeOptions))
        .pipe(new ConsoleWritable({ out: (n, o) => {
            let r = ramda_1.join("\n", ramda_1.sortBy(a => a, ramda_1.keys(o)));
            console.log(r);
        } }, "Error: "));
}
exports.listExisting = listExisting;
function listDownload(rootDir, configDir) {
    function toFileListScanFunc(acc, a, next) {
        let cPaths = a.record.filter(rec => { return rec.proceed; }).map(rec => rec.path);
        next(null, acc.concat(cPaths));
    }
    ;
    let viewTransform = new streamdash_1.ScanTransform(toFileListScanFunc, [], { objectMode: true, highWaterMark: 1 });
    ;
    listDownloadImpl(rootDir, configDir)
        .pipe(viewTransform)
        .pipe(new streamdash_1.FinalDuplex(stdPipeOptions))
        .pipe(new streamdash_1.FlattenTransform({ objectMode: true }))
        .pipe(new ConsoleWritable({ out: (n, o) => { console.log(`${o}`); } }, "Error: "));
}
exports.listDownload = listDownload;
function download(rootDir, configDir, { quiet }) {
    let config = readConfig(configDir);
    let remoteType = getRemoteType(config.remote);
    let barUpdater = managed_multi_progress_1.default(5, {
        current: 0,
        total: 0,
        format: '[:bar] :current/:total - :title',
        id: 'main',
        width: 9,
        complete: '#',
        incomplete: '-',
    }, {
        total: 9,
        width: 9,
        format: '[:bar] :current/:total - :title',
    });
    let overallBar = getOverallBar(barUpdater, quiet, true);
    function notificationHandler(id, status) {
        if (quiet) {
            return;
        }
        let statuses = {
            Analyzing: 1,
            Downloading: 2,
            Skipping: 3,
            Downloaded: 4,
            Decrypting: 5,
            Decrypted: 6,
            Copying: 7,
            Copied: 8,
            Finished: 9,
        };
        if (!statuses.hasOwnProperty(status)) {
            throw new Error("notificationHandler: Could not find status '" + status + "'");
        }
        let d = {
            id,
            current: statuses[status],
            params: { title: `${status}: ${getProgressBarTitle(id, false)}` }
        };
        barUpdater(d);
    }
    let toDownloadedParts = preparePipe(new streamdash_1.MapTransform(getToDownloadedPartsMapFunc_2.default(getToDownloadedPartsMapFunc_1.getDependencies(remoteType), configDir, removeProtocol(config.remote), notificationHandler), stdPipeOptions));
    let toFile = preparePipe(new streamdash_1.MapTransform(getToFileMapFunc_2.default(getToFileMapFunc_1.getDependencies(), configDir, rootDir, notificationHandler), stdPipeOptions));
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
exports.download = download;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQXlOO0FBQ3pOLCtCQUE4QjtBQUM5QiwyQkFBb0Q7QUFDcEQsaUdBQTBGO0FBQzFGLHlDQUFrQztBQUNsQyxxR0FBOEY7QUFFOUYseURBQXFGO0FBQ3JGLHlEQUFrRDtBQUNsRCxtRUFBMEQ7QUFFMUQsK0VBQTJHO0FBQzNHLCtFQUF3RTtBQUN4RSxpR0FBc0g7QUFDdEgscUdBQThGO0FBQzlGLHlFQUFrRTtBQUNsRSx5REFBa0Q7QUFDbEQsaURBQThDO0FBQzlDLCtCQUFxQztBQUNyQyxpRUFBd0Q7QUFDeEQsaUVBQThEO0FBQzlELDJDQUF3SjtBQUN4SixtR0FBNEY7QUFDNUYseUVBQXNFO0FBQ3RFLDZFQUFxRjtBQUNyRiw2RUFBMEU7QUFDMUUsaUhBQXNJO0FBQ3RJLGlIQUEwRztBQUMxRywrRUFBcUg7QUFDckgsK0VBQTRFO0FBQzVFLG1FQUF1RTtBQUN2RSwyQ0FBd0M7QUFDeEMscUdBQWdHO0FBQ2hHLDJCQUEwQjtBQUMxQix1R0FBZ0c7QUFDaEcsdUtBQXVLO0FBQ3ZLLDJIQUFvSDtBQUNwSCxpQ0FBd0Q7QUFDeEQseUdBQWtHO0FBQ2xHLDJGQUErRDtBQUMvRCxpQ0FBaUM7QUFDakMscUNBQTZCO0FBRzdCLE1BQU0sY0FBYyxHQUFHLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFDLENBQUM7QUFFN0QsTUFBTSxPQUFPLEdBQUcsV0FBSSxDQUFDLGNBQU8sQ0FBQyxjQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUUxRCxxQkFBc0IsU0FBUSxpQ0FBZ0I7SUFLMUMsWUFBWSxFQUFDLEdBQUcsRUFBQyxFQUFFLElBQVk7UUFDM0IsS0FBSyxDQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFD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