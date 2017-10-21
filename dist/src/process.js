"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const fs_1 = require("fs");
const getToRemotePendingCommitStatsMapFunc_1 = require("./getToRemotePendingCommitStatsMapFunc");
const safeSize_1 = require("./safeSize");
const getToRemotePendingCommitDeciderMapFunc_1 = require("./getToRemotePendingCommitDeciderMapFunc");
const getToFileMapFunc_1 = require("./getToFileMapFunc");
const getToFileMapFunc_2 = require("./getToFileMapFunc");
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
        this.out(this.name, JSON.stringify(ob));
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
let errorStream = new streamdash_1.ErrorStream({ objectMode: true }), errorOut = new ConsoleWritable({ out: console.log }, "Error: "), preparePipe = getPreparePipe(errorStream);
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
        .on('finish', () => {
        if (!quiet) {
            console.log("All metadata uploaded, backup complete");
        }
    });
}
exports.push = push;
function upload(rootDir, configDir) {
    const filePartByteCountThreshold = 1024 * 1024 * 64, // 64MB
    commitFileByteCountThreshold = 1024 * 1024 * 256, // 256MB
    commitMaxDelay = 1000 * 60 * 5;
    const quiet = false;
    if (!safeSize_1.default(filePartByteCountThreshold)) {
        throw new Error(`The size ${filePartByteCountThreshold} is not a safe size`);
    }
    if (!safeSize_1.default(commitFileByteCountThreshold)) {
        throw new Error(`The size ${commitFileByteCountThreshold} is not a safe size`);
    }
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 }, tmpDir = path_1.join(configDir, "tmp"), commitDir = 'commit', remoteCommitDir = 'remote-commit', pendingCommitDir = 'pending-commit', config = readConfig(configDir), clientId = config['client-id'], s3Bucket = config.remote, gpgKey = config['gpg-key'], fpGpgKey = config['filepart-gpg-key'], rootReader = new RootReadable_1.RootReadable({ glob: RootReadable_1.RootReadable.getGlobFunc() }, rootDir, []), filenameToFile = new streamdash_1.MapTransform(getFilenameToFileMapFunc_1.getFilenameToFileMapFunc({ stat: fs_2.stat }, rootDir), stdPipeOptions), fileToSha256File = new streamdash_1.MapTransform(getFileToSha256FileMapFunc_1.getFileToSha256FileMapFunc({ runner: getFileToSha256FileMapFunc_1.getRunner({ cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({}) }) }, rootDir), stdPipeOptions), fileToSha256FilePart = new Sha256FileToSha256FilePart_1.Sha256FileToSha256FilePart(rootDir, filePartByteCountThreshold, stdPipeOptions), uploadedS3FilePartsToCommit = new UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit(UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit.getDependencies(), clientId, gpgKey, commitFileByteCountThreshold, commitMaxDelay, stdPipeOptions), sha256FilePartToUploadedS3FilePart = new streamdash_1.MapTransform(getSha256FilePartToUploadedFilePart(rootDir, config.remote, fpGpgKey, filePartByteCountThreshold), stdPipeOptions), commitToCommitted = new streamdash_1.MapTransform(getCommitToCommittedMapFunc_1.getCommitToCommittedMapFunc(getCommitToCommittedMapFunc_1.getCommitToCommittedMapFuncDependencies(), configDir), stdPipeOptions), localCommitFileToCommit = new streamdash_1.MapTransform(getLocalCommitFilenameToCommitMapFunc_1.default({ readFile: fs_1.readFile }, configDir), stdPipeOptions), commitToBackupCheckDatabase = new streamdash_1.ScanTransform(getCommitToBackupCheckDatabaseScanFunc_1.default({}), {}, stdPipeOptions), backupCheckDatabaseFinal = new streamdash_1.FinalDuplex({ objectMode: true });
    let fileNotBackedUpRightAfterLeft = new streamdash_1.RightAfterLeft(getFileNotBackedUpRightAfterLeftMapFunc_1.default({}), stdPipeOptions);
    getSortedCommitFilenamePipe(configDir, [pendingCommitDir, commitDir, remoteCommitDir])
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
    repositoryCommitFiles.pipe(toRemoteCommit).on('finish', () => {
        if (!quiet) {
            console.log("All commits fetched, you may now `download`");
        }
    });
}
exports.fetch = fetch;
function download(rootDir, configDir) {
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
    let toRemotePendingCommitDecider = preparePipe(new streamdash_1.MapTransform(getToRemotePendingCommitDeciderMapFunc_1.default({}), stdPipeOptions));
    let toDownloadedParts = preparePipe(new streamdash_1.MapTransform(getToDownloadedPartsMapFunc_2.default(getToDownloadedPartsMapFunc_1.getDependencies(remoteType), configDir, removeProtocol(config.remote)), stdPipeOptions));
    let toFile = preparePipe(new streamdash_1.MapTransform(getToFileMapFunc_2.default(getToFileMapFunc_1.getDependencies(), configDir, rootDir), stdPipeOptions));
    remotePendingCommitStream.pipe(remotePendingCommitLocalInfoStream.right);
    processedCommitStream.pipe(remotePendingCommitLocalInfoStream.left);
    remotePendingCommitLocalInfoStream
        .pipe(toRemotePendingCommitStats)
        .pipe(toRemotePendingCommitDecider)
        .pipe(toDownloadedParts)
        .pipe(toFile)
        .on('finish', () => {
        if (!quiet) {
            console.log("All data downloaded");
        }
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
exports.download = download;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQTBRO0FBQzFRLDJCQUFvRDtBQUNwRCxpR0FBMEY7QUFDMUYseUNBQWtDO0FBQ2xDLHFHQUE4RjtBQUU5Rix5REFBcUY7QUFDckYseURBQWtEO0FBR2xELCtFQUEyRztBQUMzRywrRUFBd0U7QUFDeEUsaUdBQXNIO0FBQ3RILHFHQUE4RjtBQUM5Rix5RUFBa0U7QUFDbEUseURBQWtEO0FBQ2xELGlEQUE4QztBQUM5QywrQkFBcUM7QUFDckMsaUVBQXdEO0FBQ3hELGlFQUE4RDtBQUM5RCwyQ0FBbUo7QUFDbkosbUdBQTRGO0FBQzVGLHlFQUFzRTtBQUN0RSw2RUFBcUY7QUFDckYsNkVBQTBFO0FBQzFFLGlIQUFzSTtBQUN0SSxpSEFBMEc7QUFDMUcsK0VBQXFIO0FBQ3JILCtFQUE0RTtBQUM1RSxtRUFBK0U7QUFDL0UsMkNBQXdDO0FBQ3hDLHFHQUFnRztBQUVoRywyQkFBMEI7QUFDMUIsdUdBQWdHO0FBQ2hHLHVLQUF1SztBQUN2SywySEFBb0g7QUFFcEgseUdBQWtHO0FBQ2xHLGlDQUFpQztBQUNqQyxxQ0FBNkI7QUFFN0IsTUFBTSxPQUFPLEdBQUcsV0FBSSxDQUFDLGNBQU8sQ0FBQyxjQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUUxRCxxQkFBc0IsU0FBUSxpQ0FBZ0I7SUFLMUMsWUFBWSxFQUFDLEdBQUcsRUFBQyxFQUFFLElBQVk7UUFDM0IsS0FBSyxDQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUNu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