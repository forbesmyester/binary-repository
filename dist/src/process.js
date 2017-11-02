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
        this.onPassedThrough(a);
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
    let totalItems = 0, currentItem = 0;
    let plus = new Spy((a) => {
        if (!quiet) {
            barUpdater({
                id: "main",
                total: totalItems += 1,
                current: currentItem,
                params: { total: totalItems, title: "Overall" }
            });
        }
    }, { objectMode: true });
    let minus = new Spy((a) => {
        if (!quiet) {
            barUpdater({
                id: "main",
                total: totalItems,
                current: currentItem += 1,
                params: { current: currentItem, title: "Overall" }
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
            if (!quiet) {
                const length = 60;
                let p = (a.path.length <= length) ? a.path :
                    a.path.substr(a.path.length - length);
                barUpdater({
                    id: a.path,
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
    const quiet = false;
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
    repositoryCommitFiles.pipe(toRemoteCommit)
        .pipe(preparePipe(new EndWritable()))
        .on('finish', () => {
        if (!quiet) {
            console.log("All commits fetched, you may now `download`");
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
                const length = 60;
                let p = (a.path.length <= length) ? a.path :
                    a.path.substr(a.path.length - length);
                barUpdater({
                    id: a.path,
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