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
const getRepositoryCommitToRemoteCommitMapFunc_1 = require("./getRepositoryCommitToRemoteCommitMapFunc");
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
    _write(ob, encoding, cb) { process.stdout.write("."); cb(); }
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
function push(rootDir, configDir) {
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
    const quiet = false;
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
function getOverallBar(barUpdater, quiet) {
    const length = 45;
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
            if (a && a.path && a.path.substr) {
                p = (a.path.length <= length) ? a.path :
                    a.path.substr(a.path.length - length);
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
    return {
        minus,
        plus
    };
}
function upload(rootDir, configDir) {
    const filePartByteCountThreshold = 1024 * 1024 * 64, // 64MB
    commitFileByteCountThreshold = 1024 * 1024 * 256, // 256MB
    commitMaxDelay = 1000 * 60 * 5;
    const quiet = false;
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
                const length = 45;
                let p = (a.path.length <= length) ? a.path :
                    a.path.substr(a.path.length - length);
                barUpdater({
                    id: p,
                    current: n,
                    params: { title: util_1.format(t, p) }
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
function fetch(rootDir, configDir) {
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 }, cmdSpawner = CmdRunner_1.CmdRunner.getCmdSpawner({}), config = readConfig(configDir), remoteType = getRemoteType(config.remote), globber = RootReadable_1.RootReadable.getGlobFunc(), repositoryCommitFiles = null, cmd = '';
    const quiet = false, barUpdater = managed_multi_progress_1.default(5, {
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
        cmd = 'bash/download-cat';
        repositoryCommitFiles = preparePipe(new CommitFilenameLocalFiles_1.default({ glob: globber }, removeProtocol(config['remote']), { objectMode: true }));
    }
    if (remoteType == Types_1.RemoteType.S3) {
        cmd = 'bash/download-s3';
        repositoryCommitFiles = preparePipe(new CommitFilenameS3_1.default(new aws_sdk_1.S3(), removeProtocol(config['remote']), { objectMode: true }));
    }
    if (repositoryCommitFiles === null) {
        throw new Error("Could not identify repository type");
    }
    let toRemoteCommit = preparePipe(new streamdash_1.MapTransform(getRepositoryCommitToRemoteCommitMapFunc_1.default({ cmdSpawner: cmdSpawner, rename: fs_1.rename, mkdirp }, configDir, removeProtocol(config['remote']), config['gpg-key'], cmd), { objectMode: true }));
    repositoryCommitFiles
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
function listDownloadImpl(rootDir, configDir) {
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 };
    let config = readConfig(configDir);
    const quiet = false;
    let remoteType = getRemoteType(config.remote);
    function getCommitStream(configDir, subDirs, onlyFirst) {
        let sortedPendingCommitFilenameStream = getSortedCommitFilenamePipe(configDir, subDirs);
        let toCommitStream = preparePipe(new streamdash_1.MapTransform(getLocalCommitFilenameToCommitMapFunc_1.default({ readFile: fs_1.readFile }, configDir), stdPipeOptions));
        return sortedPendingCommitFilenameStream
            .pipe(toCommitStream);
    }
    let remotePendingCommitStream = getCommitStream(configDir, ['remote-pending-commit'], false);
    let processedCommitStream = getCommitStream(configDir, ['commit', 'remote-commit'], false);
    let toBackupCheckDatabaseScan = preparePipe(new streamdash_1.ScanTransform(getCommitToBackupCheckDatabaseScanFunc_1.default({}), {}, stdPipeOptions));
    let toBackupCheckDatabaseFinal = preparePipe(new streamdash_1.FinalDuplex(stdPipeOptions));
    processedCommitStream
        .pipe(toBackupCheckDatabaseScan)
        .pipe(toBackupCheckDatabaseFinal);
    let remotePendingCommitLocalInfoStream = preparePipe(new streamdash_1.RightAfterLeft(getToRemotePendingCommitInfoRightAfterLeftMapFunc_1.default({}), stdPipeOptions));
    let toRemotePendingCommitStats = preparePipe(new streamdash_1.MapTransform(getToRemotePendingCommitStatsMapFunc_1.default(getToRemotePendingCommitStatsMapFunc_2.getDependencies(), rootDir), stdPipeOptions));
    remotePendingCommitStream.pipe(remotePendingCommitLocalInfoStream.right);
    processedCommitStream.pipe(remotePendingCommitLocalInfoStream.left);
    let toRemotePendingCommitDecider = preparePipe(new streamdash_1.MapTransform(getToRemotePendingCommitDeciderMapFunc_1.default({}), stdPipeOptions));
    return remotePendingCommitLocalInfoStream.pipe(toRemotePendingCommitStats)
        .pipe(toRemotePendingCommitDecider);
}
exports.listDownloadImpl = listDownloadImpl;
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
        .pipe(new streamdash_1.FinalDuplex({ objectMode: true }))
        .pipe(new streamdash_1.FlattenTransform({ objectMode: true }))
        .pipe(new ConsoleWritable({ out: (n, o) => { console.log(`${o}`); } }, "Error: "));
}
exports.listDownload = listDownload;
function download(rootDir, configDir) {
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 };
    let config = readConfig(configDir);
    const quiet = false;
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
        total: 3,
        width: 9,
        format: '[:bar] :current/:total - :title',
    });
    let overallBar = getOverallBar(barUpdater, quiet);
    function getFileSpy(t, n) {
        return new Spy((a) => {
            if (!quiet) {
                const length = 45;
                let p = (a.path.length <= length) ? a.path :
                    a.path.substr(a.path.length - length);
                barUpdater({
                    id: p,
                    current: n,
                    params: { title: util_1.format(t, p) }
                });
            }
        }, stdPipeOptions);
    }
    let toDownloadedParts = preparePipe(new streamdash_1.MapTransform(getToDownloadedPartsMapFunc_2.default(getToDownloadedPartsMapFunc_1.getDependencies(remoteType), configDir, removeProtocol(config.remote)), stdPipeOptions));
    let toFile = preparePipe(new streamdash_1.MapTransform(getToFileMapFunc_2.default(getToFileMapFunc_1.getDependencies(), configDir, rootDir), stdPipeOptions));
    listDownloadImpl(rootDir, configDir)
        .pipe(overallBar.plus) // TODO: Make per file not commit
        .pipe(toDownloadedParts)
        .pipe(overallBar.minus)
        .pipe(toFile)
        .pipe(preparePipe(new EndWritable()))
        .on('finish', () => {
        if (!quiet) {
            barUpdater.terminate("All data downloaded");
        }
    });
}
exports.download = download;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQTBTO0FBQzFTLCtCQUE4QjtBQUM5QiwyQkFBb0Q7QUFDcEQsaUdBQTBGO0FBQzFGLHlDQUFrQztBQUNsQyxxR0FBOEY7QUFFOUYseURBQXFGO0FBQ3JGLHlEQUFrRDtBQUNsRCxtRUFBMEQ7QUFFMUQsK0VBQTJHO0FBQzNHLCtFQUF3RTtBQUN4RSxpR0FBc0g7QUFDdEgscUdBQThGO0FBQzlGLHlFQUFrRTtBQUNsRSx5REFBa0Q7QUFDbEQsaURBQThDO0FBQzlDLCtCQUFxQztBQUNyQyxpRUFBd0Q7QUFDeEQsaUVBQThEO0FBQzlELDJDQUFxSztBQUNySyxtR0FBNEY7QUFDNUYseUVBQXNFO0FBQ3RFLDZFQUFxRjtBQUNyRiw2RUFBMEU7QUFDMUUsaUhBQXNJO0FBQ3RJLGlIQUEwRztBQUMxRywrRUFBcUg7QUFDckgsK0VBQTRFO0FBQzVFLG1FQUErRTtBQUMvRSwyQ0FBd0M7QUFDeEMscUdBQWdHO0FBRWhHLDJCQUEwQjtBQUMxQix1R0FBZ0c7QUFDaEcsdUtBQXVLO0FBQ3ZLLDJIQUFvSDtBQUVwSCx5R0FBa0c7QUFDbEcsaUNBQWlDO0FBQ2pDLHFDQUE2QjtBQUU3QixNQUFNLE9BQU8sR0FBRyxXQUFJLENBQUMsY0FBTyxDQUFDLGNBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRTFELHFCQUFzQixTQUFRLGlDQUFnQjtJQUsxQyxZQUFZLEVBQUMsR0FBRyxFQUFDLEVBQUUsSUFBWTtRQUMzQixLQUFLLENBQUMsRUFBQyxVQUFVLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxNQUFNLENBQUMsRUFB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