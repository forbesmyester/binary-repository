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
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 }, config = readConfig(configDir), gpgKey = config['gpg-key'], pendingCommitDir = 'pending-commit', s3Bucket = config.remote;
    let commitedToUploadedCommitted = new streamdash_1.MapTransform(getCommittedToUploadedCommittedMapFunc(configDir, s3Bucket, gpgKey), { objectMode: true }), localCommitFileToCommit = new streamdash_1.MapTransform(getLocalCommitFilenameToCommitMapFunc_1.default({ readFile: fs_1.readFile }, configDir), stdPipeOptions);
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
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 }, commitDir = 'commit', remoteCommitDir = 'remote-commit', pendingCommitDir = 'pending-commit';
    let fileNotBackedUpRightAfterLeft = new streamdash_1.RightAfterLeft(getFileNotBackedUpRightAfterLeftMapFunc_1.default({}), stdPipeOptions), localCommitFileToCommit = new streamdash_1.MapTransform(getLocalCommitFilenameToCommitMapFunc_1.default({ readFile: fs_1.readFile }, configDir), stdPipeOptions), commitToBackupCheckDatabase = new streamdash_1.ScanTransform(getCommitToBackupCheckDatabaseScanFunc_1.default({}), {}, stdPipeOptions), rootReader = new RootReadable_1.RootReadable({ glob: RootReadable_1.RootReadable.getGlobFunc() }, rootDir, []), filenameToFile = new streamdash_1.MapTransform(getFilenameToFileMapFunc_1.getFilenameToFileMapFunc({ stat: fs_2.stat }, rootDir), stdPipeOptions), backupCheckDatabaseFinal = new streamdash_1.FinalDuplex({ objectMode: true });
    getSortedCommitFilenamePipe(configDir, [pendingCommitDir, commitDir, remoteCommitDir])
        .pipe(preparePipe(localCommitFileToCommit))
        .pipe(preparePipe(commitToBackupCheckDatabase))
        .pipe(preparePipe(backupCheckDatabaseFinal))
        .pipe(preparePipe(fileNotBackedUpRightAfterLeft.left));
    let listFiles = preparePipe(rootReader)
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
    }, { objectMode: true });
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
    }, { objectMode: true });
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
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 }, tmpDir = path_1.join(configDir, "tmp"), commitDir = 'commit', remoteCommitDir = 'remote-commit', pendingCommitDir = 'pending-commit', config = readConfig(configDir), clientId = config['client-id'], s3Bucket = config.remote, gpgKey = config['gpg-key'], fpGpgKey = config['filepart-gpg-key'], fileToSha256File = new streamdash_1.MapTransform(getFileToSha256FileMapFunc_1.getFileToSha256FileMapFunc({ runner: getFileToSha256FileMapFunc_1.getRunner({ cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({}) }) }, rootDir), stdPipeOptions), fileToSha256FilePart = new Sha256FileToSha256FilePart_1.Sha256FileToSha256FilePart(rootDir, filePartByteCountThreshold, stdPipeOptions), uploadedS3FilePartsToCommit = new UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit(UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit.getDependencies(), clientId, gpgKey, commitFileByteCountThreshold, commitMaxDelay, stdPipeOptions), sha256FilePartToUploadedS3FilePart = new streamdash_1.MapTransform(getSha256FilePartToUploadedFilePart(rootDir, config.remote, fpGpgKey, filePartByteCountThreshold), stdPipeOptions), commitToCommitted = new streamdash_1.MapTransform(getCommitToCommittedMapFunc_1.getCommitToCommittedMapFunc(getCommitToCommittedMapFunc_1.getCommitToCommittedMapFuncDependencies(), configDir), stdPipeOptions);
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
    let totalItems = 0;
    let currentItem = 0;
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
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 }, cmdSpawner = CmdRunner_1.CmdRunner.getCmdSpawner({}), config = readConfig(configDir), remoteType = getRemoteType(config.remote), globber = RootReadable_1.RootReadable.getGlobFunc(), repositoryCommitFiles = null, cmd = '', commitDir = 'commit', remoteCommitDir = 'remote-commit', pendingCommitDir = 'pending-commit';
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
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 };
    let sortedPendingCommitFilenameStream = getSortedCommitFilenamePipe(configDir, subDirs);
    let toCommitStream = preparePipe(new streamdash_1.MapTransform(getLocalCommitFilenameToCommitMapFunc_1.default({ readFile: fs_1.readFile }, configDir), stdPipeOptions));
    return sortedPendingCommitFilenameStream
        .pipe(toCommitStream);
}
function listDownloadImpl(rootDir, configDir) {
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 };
    let config = readConfig(configDir);
    const quiet = false;
    let remoteType = getRemoteType(config.remote);
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
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 };
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
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 };
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
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 };
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
        .pipe(overallBar.plus) // TODO: Make per file not commit
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQTBTO0FBQzFTLCtCQUE4QjtBQUM5QiwyQkFBb0Q7QUFDcEQsaUdBQTBGO0FBQzFGLHlDQUFrQztBQUNsQyxxR0FBOEY7QUFFOUYseURBQXFGO0FBQ3JGLHlEQUFrRDtBQUNsRCxtRUFBMEQ7QUFFMUQsK0VBQTJHO0FBQzNHLCtFQUF3RTtBQUN4RSxpR0FBc0g7QUFDdEgscUdBQThGO0FBQzlGLHlFQUFrRTtBQUNsRSx5REFBa0Q7QUFDbEQsaURBQThDO0FBQzlDLCtCQUFxQztBQUNyQyxpRUFBd0Q7QUFDeEQsaUVBQThEO0FBQzlELDJDQUFxSztBQUNySyxtR0FBNEY7QUFDNUYseUVBQXNFO0FBQ3RFLDZFQUFxRjtBQUNyRiw2RUFBMEU7QUFDMUUsaUhBQXNJO0FBQ3RJLGlIQUEwRztBQUMxRywrRUFBcUg7QUFDckgsK0VBQTRFO0FBQzVFLG1FQUErRTtBQUMvRSwyQ0FBd0M7QUFDeEMscUdBQWdHO0FBRWhHLDJCQUEwQjtBQUMxQix1R0FBZ0c7QUFDaEcsdUtBQXVLO0FBQ3ZLLDJIQUFvSDtBQUNwSCxpQ0FBdUU7QUFDdkUseUdBQWtHO0FBQ2xHLDJGQUErRDtBQUMvRCxpQ0FBaUM7QUFDakMscUNBQTZCO0FBRTdCLE1BQU0sT0FBTyxHQUFHLFdBQUksQ0FBQyxjQUFPLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFMUQscUJBQXNCLFNBQVEsaUNBQWdCO0lBSzFDLFlBQVksRUFBQyxHQUFHLEVBQUMsRUFBRSxJQUFZO1FBQzNCLEtBQUssQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFD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