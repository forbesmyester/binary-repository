import { CommitFilename, Callback, AbsoluteFilePath, AbsoluteDirectoryPath, GpgKey, S3Object, S3BucketName, CommandName } from  './Types';
import { dirname, join } from 'path';
import { ExitStatus, CmdOutput, CmdSpawner, CmdRunner } from './CmdRunner';
import { rename } from 'fs';
import { MapFunc, streamDataCollector, Transform } from 'streamdash';
import {} from "./UploadedS3FilePartsToCommit";
import { assoc } from 'ramda';
import * as mkdirp from 'mkdirp';

export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}

/**
 * The environment to pass when executing the command to segment, encrypt and
 * upload to S3
 */
interface UploadS3Environment {
    OPT_DD_BS: number;
    OPT_DD_SKIP: number;
    OPT_IS_LAST: number;
    OPT_DD_FILENAME: AbsoluteFilePath;
    OPT_GPG_KEY: GpgKey;
    OPT_S3_BUCKET: S3BucketName;
    OPT_S3_OBJECT: S3Object;
}

function getEnv(gpgKey: GpgKey, s3Bucket: S3BucketName, configDir: AbsoluteDirectoryPath,  a: CommitFilename): UploadS3Environment {

    return {
        OPT_DD_BS: 1,
        OPT_DD_SKIP: 0,
        OPT_IS_LAST: 1,
        OPT_S3_OBJECT: a.path,
        OPT_DD_FILENAME: join(configDir, 'pending-commit', a.path),
        OPT_GPG_KEY: gpgKey,
        OPT_S3_BUCKET: s3Bucket
    };

}

export interface Dependencies {
    cmdSpawner: CmdSpawner;
    rename: (src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
}


export function getDependencies(): Dependencies {
    return { rename, mkdirp, cmdSpawner: CmdRunner.getCmdSpawner({}) };
}

function myRename(mkdirp, rename, s, d, n: Callback<void>) {
    mkdirp(dirname(d), (e) => {
        if (e) { return n(e); }
        rename(s, d, (e) => {
            n(e);
        });
    });
}

export default function getCommittedToUploadedCommittedMapFunc(
    { rename, cmdSpawner }: Dependencies,
    configDir: AbsoluteDirectoryPath,
    s3Bucket: S3BucketName,
    gpgKey: GpgKey,
    cmd: CommandName
    // TODO: Pass in CmdSpawner
): MapFunc<CommitFilename, CommitFilename> {

    return function(a: CommitFilename, cb) {

        let cmdRunner = new CmdRunner(
            { cmdSpawner },
            Object.assign({}, process.env, getEnv(gpgKey, s3Bucket, configDir, a)),
            ".",
            cmd,
            [],
            {}
        );

        let sdc = streamDataCollector(cmdRunner)
            .then((lines) => {
                myRename(
                    mkdirp,
                    rename,
                    join(configDir, 'pending-commit', a.path),
                    join(configDir, 'commit', a.path),
                    e => { cb(e, a); }
                );
            })
            .catch((err) => {
                cb(err); // TODO: What do we need to do here to make sure that
                         // errors are readable by an end user?
            });

    };
}

