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
        return getSha256FilePartToUploadedS3FilePartMapFunc_2.default(getSha256FilePartToUploadedS3FilePartMapFunc_1.getDependencies(Types_1.RemoteType.S3), rootDir, removeProtocol(remote), gpgKey, filePartByteCountThreshold, './bash/upload-s3');
    }
    if (remote.match(/^file\:\/\//)) {
        return getSha256FilePartToUploadedS3FilePartMapFunc_2.default(getSha256FilePartToUploadedS3FilePartMapFunc_1.getDependencies(Types_1.RemoteType.LOCAL_FILES), rootDir, removeProtocol(remote), gpgKey, filePartByteCountThreshold, './bash/upload-cat');
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
            return getCommittedToUploadedCommittedMapFunc_1.default({ mkdirp, cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({}), rename: fs_1.rename }, configDir, removeProtocol(remote), gpgKey, './bash/upload-s3');
        }
        if (remote.match(/^file\:\/\//)) {
            return getCommittedToUploadedCommittedMapFunc_1.default({ mkdirp, cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({}), rename: fs_1.rename }, configDir, removeProtocol(remote), gpgKey, './bash/upload-cat');
        }
        throw new Error("NO_REMOTE_PROTOCOL: Cannot figure out where to copy file parts");
    }
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 }, config = readConfig(configDir), gpgKey = config['gpg-encryption-key'], pendingCommitDir = 'pending-commit', s3Bucket = config.remote;
    let commitedToUploadedCommitted = new streamdash_1.MapTransform(getCommittedToUploadedCommittedMapFunc(configDir, s3Bucket, gpgKey), { objectMode: true }), localCommitFileToCommit = new streamdash_1.MapTransform(getLocalCommitFilenameToCommitMapFunc_1.default({ readFile: fs_1.readFile }, configDir), stdPipeOptions);
    getSortedCommitFilenamePipe(configDir, [pendingCommitDir])
        .pipe(preparePipe(commitedToUploadedCommitted));
}
exports.push = push;
function commit(rootDir, configDir) {
    const filePartByteCountThreshold = 1024 * 1024 * 64, // 64MB
    commitFileByteCountThreshold = 1024 * 1024 * 256, // 256MB
    commitMaxDelay = 1000 * 60 * 5;
    let quiet = false;
    if (!safeSize_1.default(filePartByteCountThreshold)) {
        throw new Error(`The size ${filePartByteCountThreshold} is not a safe size`);
    }
    if (!safeSize_1.default(commitFileByteCountThreshold)) {
        throw new Error(`The size ${commitFileByteCountThreshold} is not a safe size`);
    }
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 }, tmpDir = path_1.join(configDir, "tmp"), commitDir = 'commit', remoteCommitDir = 'remote-commit', config = readConfig(configDir), clientId = config['client-id'], s3Bucket = config.remote, gpgKey = config['gpg-encryption-key'], fpGpgKey = config['filepart-gpg-encryption-key'], rootReader = new RootReadable_1.RootReadable({ glob: RootReadable_1.RootReadable.getGlobFunc() }, rootDir, []), filenameToFile = new streamdash_1.MapTransform(getFilenameToFileMapFunc_1.getFilenameToFileMapFunc({ stat: fs_2.stat }, rootDir), stdPipeOptions), fileToSha256File = new streamdash_1.MapTransform(getFileToSha256FileMapFunc_1.getFileToSha256FileMapFunc({ runner: getFileToSha256FileMapFunc_1.getRunner({ cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({}) }) }, rootDir), stdPipeOptions), fileToSha256FilePart = new Sha256FileToSha256FilePart_1.Sha256FileToSha256FilePart(rootDir, filePartByteCountThreshold, stdPipeOptions), uploadedS3FilePartsToCommit = new UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit(UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit.getDependencies(), clientId, gpgKey, commitFileByteCountThreshold, commitMaxDelay, {}), sha256FilePartToUploadedS3FilePart = new streamdash_1.MapTransform(getSha256FilePartToUploadedFilePart(rootDir, config.remote, fpGpgKey, filePartByteCountThreshold), stdPipeOptions), commitToCommitted = new streamdash_1.MapTransform(getCommitToCommittedMapFunc_1.getCommitToCommittedMapFunc(getCommitToCommittedMapFunc_1.getCommitToCommittedMapFuncDependencies(), configDir), stdPipeOptions), localCommitFileToCommit = new streamdash_1.MapTransform(getLocalCommitFilenameToCommitMapFunc_1.default({ readFile: fs_1.readFile }, configDir), stdPipeOptions), commitToBackupCheckDatabase = new streamdash_1.ScanTransform(getCommitToBackupCheckDatabaseScanFunc_1.default({}), {}, { objectMode: true }), backupCheckDatabaseFinal = new streamdash_1.FinalDuplex({ objectMode: true });
    let fileNotBackedUpRightAfterLeft = new streamdash_1.RightAfterLeft(getFileNotBackedUpRightAfterLeftMapFunc_1.default({}), { objectMode: true });
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
            console.log("All data uploaded to repository and committed");
        }
    });
}
exports.commit = commit;
function fetch(rootDir, configDir) {
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 }, cmdSpawner = CmdRunner_1.CmdRunner.getCmdSpawner({}), config = readConfig(configDir), remoteType = getRemoteType(config.remote), globber = RootReadable_1.RootReadable.getGlobFunc(), repositoryCommitFiles = null, cmd = '';
    let quiet = false;
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
    let toRemoteCommit = preparePipe(new streamdash_1.MapTransform(getRepositoryCommitToRemoteCommitMapFunc_1.default({ cmdSpawner: cmdSpawner, rename: fs_1.rename, mkdirp }, configDir, removeProtocol(config['remote']), config['gpg-encryption-key'], cmd), { objectMode: true }));
    repositoryCommitFiles.pipe(toRemoteCommit).on('finish', () => {
        if (!quiet) {
            console.log("All commits fetched, you may now download");
        }
    });
}
exports.fetch = fetch;
function download(rootDir, configDir) {
    let stdPipeOptions = { objectMode: true, highWaterMark: 1 };
    let config = readConfig(configDir);
    let quiet = false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQTBRO0FBQzFRLDJCQUFvRDtBQUNwRCxpR0FBMEY7QUFDMUYseUNBQWtDO0FBQ2xDLHFHQUE4RjtBQUU5Rix5REFBcUY7QUFDckYseURBQWtEO0FBR2xELCtFQUEyRztBQUMzRywrRUFBd0U7QUFDeEUsaUdBQXNIO0FBQ3RILHFHQUE4RjtBQUM5Rix5RUFBa0U7QUFDbEUseURBQWtEO0FBQ2xELGlEQUE4QztBQUM5QywrQkFBNEI7QUFDNUIsaUVBQXdEO0FBQ3hELGlFQUE4RDtBQUM5RCwyQ0FBbUo7QUFDbkosbUdBQTRGO0FBQzVGLHlFQUFzRTtBQUN0RSw2RUFBcUY7QUFDckYsNkVBQTBFO0FBQzFFLGlIQUFzSTtBQUN0SSxpSEFBMEc7QUFDMUcsK0VBQXFIO0FBQ3JILCtFQUE0RTtBQUM1RSxtRUFBK0U7QUFDL0UsMkNBQXdDO0FBQ3hDLHFHQUFnRztBQUVoRywyQkFBMEI7QUFDMUIsdUdBQWdHO0FBQ2hHLHVLQUF1SztBQUN2SywySEFBb0g7QUFFcEgseUdBQWtHO0FBQ2xHLGlDQUFpQztBQUNqQyxxQ0FBNkI7QUFFN0IscUJBQXNCLFNBQVEsaUNBQWdCO0lBSzFDLFlBQVksRUFBQyxHQUFHLEVBQUMsRUFBRSxJQUFZO1FBQzNCLEtBQUssQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVELE1BQU0sQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFDbkIsRUFBRSxDQUFDLENBQUMsRUFBRSxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FB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