import { ConfigFile, AbsoluteDirectoryPath, RelativeFilePath, Sha256, ByteCount, ModifiedDate, Callback, Sha256File, File, Commit } from './Types';
import { readFileSync, readFile } from 'fs';
import getCommitToBackupCheckDatabaseScanFunc from './getCommitToBackupCheckDatabaseScanFunc';
import { RootReadable } from './RootReadable';
import { join } from 'path';
import commitSortFunction from './commitFilenameSorter';
import { RightAfterLeft, FirstDuplex, FinalDuplex, ScanTransform, SortDuplex, ErrorStream, MapFunc, MapTransform } from 'streamdash';
import getLocalCommitFileToCommitMapFunc from './getLocalCommitFileToCommitMapFunc';
import { getFilenameToFileMapFunc } from './getFilenameToFileMapFunc';
import { getFileToSha256FileMapFunc, getRunner } from './getFileToSha256FileMapFunc';
import { Sha256FileToSha256FilePart } from './Sha256FileToSha256FilePart';
import getSha256FilePartToUploadedS3FilePartFakeMapFunc from './getSha256FilePartToUploadedS3FilePartFakeMapFunc';
import getSha256FilePartToUploadedS3FilePartMapFunc from './getSha256FilePartToUploadedS3FilePartMapFunc';
import { getCommitToCommittedMapFuncDependencies, getCommitToCommittedMapFunc } from './getCommitToCommittedMapFunc';
import { UploadedS3FilePartsToCommit } from './UploadedS3FilePartsToCommit';
import { Duplex, Readable, Transform, Writable } from 'stronger-typed-streams';
import { CmdRunner } from './CmdRunner';
import getCommittedToUploadedCommittedMapFunc from './getCommittedToUploadedCommittedMapFunc';
import getCommittedToUploadedCommittedFakeMapFunc from './getCommittedToUploadedCommittedFakeMapFunc';
import { stat } from 'fs';
import getFileNotBackedUpRightAfterLeftMapFunc from './getFileNotBackedUpRightAfterLeftMapFunc';

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


function getAppliedCommitSorted(dirs) {
    let globber = RootReadable.getGlobFunc();

    let strms = dirs.map((d) => {
        return preparePipe(new RootReadable({glob: globber}, d, []));
    });

    let commitSorter = new SortDuplex(commitSortFunction, { objectMode: true });

    strms.forEach(s => {
        s.pipe(commitSorter);
    });

    return preparePipe(commitSorter);
}



export function upload(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {

    let stdPipeOptions = { objectMode: true, highWaterMark: 1},
        tmpDir = join(configDir, "tmp"),
        commitDir = join(configDir, 'commit'),
        remoteCommitDir = join(configDir, 'remote-commit'),
        config: ConfigFile = (function() {
            let cf = join(configDir, 'config');
            try {
                return JSON.parse(readFileSync(cf, {encoding: 'utf8'}));
            }
            catch (e) {
                throw new Error(`Config file '${cf}' does not appear to be ` +
                    `valid JSON`);
            }
        }()),
        clientId = config['client-id'],
        filePartByteCountThreshold = 1024 * 1024 * 64, // 64MB
        commitFileByteCountThreshold = 1024 * 1024 * 256, // 256MB
        commitMaxDelay = 10000,
        s3Bucket = config.remote,
        gpgKey = config['gpg-encryption-key'],
        globber = RootReadable.getGlobFunc(),
        rootReader = new RootReadable({glob: globber}, rootDir, []),
        filenameToFileMapFunc = getFilenameToFileMapFunc({ stat }, rootDir),
        filenameToFile = new MapTransform(filenameToFileMapFunc, stdPipeOptions),
        cmdSpawner = CmdRunner.getCmdSpawner({}),
        runner = getRunner({ cmdSpawner }),
        fileToSha256FileMapFunc = getFileToSha256FileMapFunc({ runner }, rootDir),
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
        // sha256FilePartToUploadedS3FilePartMapFunc = getSha256FilePartToUploadedS3FilePartMapFunc(
        sha256FilePartToUploadedS3FilePartMapFunc = getSha256FilePartToUploadedS3FilePartFakeMapFunc(
            rootDir,
            s3Bucket,
            gpgKey,
            './bash/upload-filepart-s3'
        ),
        sha256FilePartToUploadedS3FilePart = new MapTransform(
            sha256FilePartToUploadedS3FilePartMapFunc,
            stdPipeOptions
        ),
        commitToCommittedMapFunc = getCommitToCommittedMapFunc(
            getCommitToCommittedMapFuncDependencies(),
            rootDir,
            tmpDir,
            commitDir
        ),
        commitToCommitted = new MapTransform(commitToCommittedMapFunc, stdPipeOptions),
        // commitedToUploadedCommittedMapFunc = getCommittedToUploadedCommittedMapFunc(
        commitedToUploadedCommittedMapFunc = getCommittedToUploadedCommittedFakeMapFunc(
            rootDir,
            commitDir,
            s3Bucket,
            gpgKey,
            './bash/upload-commit-s3'
        ),
        commitedToUploadedCommitted = new MapTransform(commitedToUploadedCommittedMapFunc, stdPipeOptions);

    let localCommitFileToCommitMapFunc = getLocalCommitFileToCommitMapFunc(
            { readFile },
            commitDir
        ),
        localCommitFileToCommit = new MapTransform(localCommitFileToCommitMapFunc, stdPipeOptions),
        commitToBackupCheckDatabaseScanFunc = getCommitToBackupCheckDatabaseScanFunc({}),
        commitToBackupCheckDatabase = new ScanTransform(
            commitToBackupCheckDatabaseScanFunc,
            {},
            { objectMode: true }
        ),
        backupCheckDatabaseFinal = new FinalDuplex({objectMode: true});

    let fileNotBackedUpRightAfterLeftMapFunc = getFileNotBackedUpRightAfterLeftMapFunc({}),
        fileNotBackedUpRightAfterLeft = new RightAfterLeft(
            fileNotBackedUpRightAfterLeftMapFunc,
            { objectMode: true }
        );


    getAppliedCommitSorted([commitDir, remoteCommitDir])
        .pipe(preparePipe(localCommitFileToCommit))
        .pipe(preparePipe(commitToBackupCheckDatabase))
        .pipe(preparePipe(backupCheckDatabaseFinal))
        .pipe(preparePipe(fileNotBackedUpRightAfterLeft.left));


    let listFiles = preparePipe(rootReader)
        .pipe(preparePipe(filenameToFile))
        .pipe(preparePipe(fileNotBackedUpRightAfterLeft.right));


    let backup = fileNotBackedUpRightAfterLeft
        .pipe(preparePipe(fileToSha256File))
        // TODO: Filter files where name == name and sha = sha
        .pipe(preparePipe(fileToSha256FilePart))
        .pipe(preparePipe(sha256FilePartToUploadedS3FilePart)) // TODO: Loses 0 length files
        .pipe(preparePipe(uploadedS3FilePartsToCommit))
        .pipe(preparePipe(commitToCommitted))
        .pipe(preparePipe(commitedToUploadedCommitted));

    backup.pipe(new ConsoleWritable({out: console.log}, "LogObj: "));

}

export function download(rootDir: AbsoluteDirectoryPath, configDir: AbsoluteDirectoryPath) {
    let remoteCommitDir = join(configDir, 'remote-commit'),
        commitDir = join(configDir, 'commit'),
        remotePendingCommitDir = join(configDir, 'remote-commit-pending');

    let remoteCommitToProcess = new FirstDuplex({objectMode: true});

    let appliedCommitStream = getAppliedCommitSorted([commitDir, remoteCommitDir]);

    let pendingRemoteCommitToProcess = getAppliedCommitSorted(remotePendingCommitDir)
        .pipe(preparePipe(remoteCommitToProcess));


    /**
     * Download all remote commits not in .ebak/commit and .ebak/remote-commit
     *   into .ebak/remote-commit-pending.
     *
     * For each sorted by commit timestamp:
     *
     *   If all local files within commit are committed:
     *
     *     For every file apply latest state. (copy over if remote newer than old)
     *
     *     Move to .ebak/remote-commit.
     *
     *   Else:
     *
     *     Warn about not being able to apply commit and suggest upload.
     *
     *     Stop.
     *
     */
}


