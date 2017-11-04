import { MapFunc } from 'streamdash';
import { CmdRunner, CmdSpawner } from './CmdRunner';
import { Callback, AbsoluteFilePath, S3Object, AbsoluteDirectoryPath, S3BucketName, GpgKey, CommandName, Filename, CommitFilename, CmdResult } from '../src/Types';
import { merge, assoc } from 'ramda';
import { streamDataCollector } from 'streamdash';
import { join } from 'path';
import { rename } from 'fs';
import * as mkdirp from 'mkdirp';

export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}

export interface Dependencies {
    cmdSpawner: CmdSpawner;
    rename: (src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
}


export function getDependencies(): Dependencies {
    return { rename, mkdirp, cmdSpawner: CmdRunner.getCmdSpawner({}) };
}

/**
 * The environment to pass when executing the command to segment.
 */
interface DownloadS3Environment {
    OPT_S3_OBJECT: S3Object;
    OPT_IS_FIRST: number;
    OPT_DESTINATION: AbsoluteFilePath;
    OPT_GPG_KEY: GpgKey;
    OPT_S3_BUCKET: S3BucketName;
}

function getEnv(gpgKey: GpgKey, s3Bucket: S3BucketName, s3Object: S3Object, configDir: AbsoluteDirectoryPath): DownloadS3Environment {

    return {
        OPT_S3_OBJECT: s3Object,
        OPT_IS_FIRST: 1,
        OPT_DESTINATION: join(configDir, 'tmp', s3Object),
        OPT_GPG_KEY: gpgKey,
        OPT_S3_BUCKET: s3Bucket
    };

}
export type RemotePendingCommitCmdResult = CommitFilename & { result: CmdResult };

export default function getRepositoryCommitToRemoteCommitMapFunc(
    dependencies: Dependencies,
    configDir: AbsoluteDirectoryPath,
    s3Bucket: S3BucketName,
    gpgKey: GpgKey,
    cmd: CommandName
): MapFunc<Filename, RemotePendingCommitCmdResult> {

    return function repositoryCommitToRemoteCommitMapFuncRealImpl(
        input: Filename,
        next: Callback<CommitFilename & { result: CmdResult }>
    ) {
        let env = getEnv(
            gpgKey,
            s3Bucket,
            input.path,
            configDir,
        );

        let cmdRunner = new CmdRunner(
            { cmdSpawner: dependencies.cmdSpawner },
            Object.assign({}, <{[k: string]: string}>process.env, env),
            ".",
            cmd,
            [],
            {}
        );

        let sdc = streamDataCollector(cmdRunner)
            .then((lines) => {
                return {
                    result: { exitStatus: 0, output: lines },
                    commitType: 'remote-pending-commit',
                    path: input.path
                };
            })
            .then((r) => {
                return new Promise((resolve, reject) => {
                    mkdirp(join(configDir, 'remote-pending-commit'), (err) => {
                        if (err) { return reject(err); }
                        resolve(r);
                    });
                });
            })
            .then((r: RemotePendingCommitCmdResult) => {
                let dest = join(configDir, 'remote-pending-commit', input.path);
                dependencies.rename(env.OPT_DESTINATION, dest, (err) => {
                    if (err) { return next(err); }
                    next(null, r);
                });
            })
            .catch((err) => { next(err); });
    };

}
