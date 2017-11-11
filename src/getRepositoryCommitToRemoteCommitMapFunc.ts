import { MapFunc } from 'streamdash';
import { CmdRunner, CmdSpawner } from './CmdRunner';
import { RemoteType, S3Location, Callback, AbsoluteFilePath, AbsoluteDirectoryPath, S3BucketName, GpgKey, Filename, CommitFilename, CmdResult } from '../src/Types';
import { streamDataCollector } from 'streamdash';
import RepositoryS3 from './repository/RepositoryS3';
import RepositoryLocalfiles from './repository/RepositoryLocalfiles';
import { dirname, join } from 'path';
import { rename } from 'fs';
import * as mkdirp from 'mkdirp';

export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}

export interface Dependencies {
    download: (tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>) => void;
    cmdSpawner: CmdSpawner;
    rename: (src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
}


export function getDependencies(mode: RemoteType): Dependencies {

    if (mode == RemoteType.S3) {
        return { download: RepositoryS3.download, rename, mkdirp, cmdSpawner: CmdRunner.getCmdSpawner({}) };
    }

    if (mode == RemoteType.LOCAL_FILES) {
        return { download: RepositoryLocalfiles.download, rename, mkdirp, cmdSpawner: CmdRunner.getCmdSpawner({}) };
    }

    throw new Error("Unsupported");
}

/**
 * The environment to pass when executing the command to segment.
 */
interface DownloadS3Environment {
    OPT_SRC: AbsoluteFilePath;
    OPT_DST: AbsoluteFilePath;
    OPT_GPG_KEY: GpgKey;
    OPT_IS_FIRST: string;
}

export type RemotePendingCommitCmdResult = CommitFilename & { result: CmdResult };

export default function getRepositoryCommitToRemoteCommitMapFunc(
    dependencies: Dependencies,
    configDir: AbsoluteDirectoryPath,
    s3Bucket: S3BucketName,
    gpgKey: GpgKey
): MapFunc<Filename, RemotePendingCommitCmdResult> {

    const bashDir = join(dirname(dirname(__dirname)), 'bash');

    return function repositoryCommitToRemoteCommitMapFuncRealImpl(
        input: Filename,
        next: Callback<CommitFilename & { result: CmdResult }>
    ) {

        let env: DownloadS3Environment = {
            OPT_SRC: join(configDir, 'tmp', input.path + '.enc'),
            OPT_DST: join(configDir, 'tmp', input.path),
            OPT_IS_FIRST: "1",
            OPT_GPG_KEY: gpgKey,
        };

        Promise.resolve(true)
            .then((r) => {
                return new Promise((resolve, reject) => {
                    dependencies.mkdirp(join(configDir, 'tmp'), (err) => {
                        if (err) { return reject(err); }
                        resolve(r);
                    });
                });
            })
            .then(() => {
                return new Promise((resolve, reject) => {
                    dependencies.download(
                        join(configDir, 'tmp'),
                        [s3Bucket, input.path],
                        join(configDir, 'tmp', input.path + '.enc'),
                        (e) => {
                            if (e) { return reject(e); }
                            resolve();
                        }
                    );
                });
            })
            .then(() => {
                let cmdRunner = new CmdRunner(
                    { cmdSpawner: dependencies.cmdSpawner },
                    Object.assign({}, <{[k: string]: string}>process.env, env),
                    ".",
                    join(bashDir, 'decrypt'),
                    [],
                    {}
                );
                return streamDataCollector(cmdRunner)
            })
            .then((lines) => {
                return {
                    result: { exitStatus: 0, output: lines },
                    commitType: 'remote-pending-commit',
                    path: input.path
                };
            })
            .then((r) => {
                return new Promise((resolve, reject) => {
                    dependencies.mkdirp(join(configDir, 'remote-pending-commit'), (err) => {
                        if (err) { return reject(err); }
                        resolve(r);
                    });
                });
            })
            .then((r: RemotePendingCommitCmdResult) => {
                let dest = join(configDir, 'remote-pending-commit', input.path);
                dependencies.rename(env.OPT_DST, dest, (err) => {
                    if (err) { return next(err); }
                    next(null, r);
                });
            })
            .catch((err) => { next(err); });
    };

}
