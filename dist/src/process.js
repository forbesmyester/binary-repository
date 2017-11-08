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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQTBTO0FBQzFTLCtCQUE4QjtBQUM5QiwyQkFBb0Q7QUFDcEQsaUdBQTBGO0FBQzFGLHlDQUFrQztBQUNsQyxxR0FBOEY7QUFFOUYseURBQXFGO0FBQ3JGLHlEQUFrRDtBQUNsRCxtRUFBMEQ7QUFFMUQsK0VBQTJHO0FBQzNHLCtFQUF3RTtBQUN4RSxpR0FBc0g7QUFDdEgscUdBQThGO0FBQzlGLHlFQUFrRTtBQUNsRSx5REFBa0Q7QUFDbEQsaURBQThDO0FBQzlDLCtCQUFxQztBQUNyQyxpRUFBd0Q7QUFDeEQsaUVBQThEO0FBQzlELDJDQUFxSztBQUNySyxtR0FBNEY7QUFDNUYseUVBQXNFO0FBQ3RFLDZFQUFxRjtBQUNyRiw2RUFBMEU7QUFDMUUsaUhBQXNJO0FBQ3RJLGlIQUEwRztBQUMxRywrRUFBcUg7QUFDckgsK0VBQTRFO0FBQzVFLG1FQUErRTtBQUMvRSwyQ0FBd0M7QUFDeEMscUdBQWdHO0FBRWhHLDJCQUEwQjtBQUMxQix1R0FBZ0c7QUFDaEcsdUtBQXVLO0FBQ3ZLLDJIQUFvSDtBQUNwSCxpQ0FBdUU7QUFDdkUseUdBQWtHO0FBQ2xHLDJGQUErRDtBQUMvRCxpQ0FBaUM7QUFDakMscUNBQTZCO0FBRTdCLE1BQU0sT0FBTyxHQUFHLFdBQUksQ0FBQyxjQUFPLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFMUQscUJBQXNCLFNBQVEsaUNBQWdCO0lBSzFDLFlBQVksRUFBQyxHQUFHLEVBQUMsRUFBRSxJQUFZO1FBQzNCLEtBQUssQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFD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