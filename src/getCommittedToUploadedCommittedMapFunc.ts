import { UploadedCommitted, CommitId, ClientId, Committed, AbsoluteFilePath, AbsoluteDirectoryPath, GpgKey, DdBs, S3BucketName, CommandName } from  './Types';
import { join } from 'path';
import { ExitStatus, CmdOutput, CmdSpawner, CmdRunner } from './CmdRunner';
import { MapFunc, streamDataCollector, Transform } from 'streamdash';
import {} from "./UploadedS3FilePartsToCommit";
import { assoc } from 'ramda';

/**
 * The environment to pass when executing the command to segment, encrypt and
 * upload to S3
 */
interface UploadS3Environment {
    OPT_CLIENT_ID: ClientId;
    OPT_COMMIT_ID: CommitId;
    OPT_DD_FILENAME: AbsoluteFilePath;
    OPT_GPG_KEY: GpgKey;
    OPT_S3_BUCKET: S3BucketName;
}

function getEnv(gpgKey: GpgKey, s3Bucket: S3BucketName, rootPath: AbsoluteDirectoryPath, commitPath: AbsoluteDirectoryPath,  a: Committed): UploadS3Environment {

    return {
        OPT_CLIENT_ID: a.clientId,
        OPT_COMMIT_ID: a.commitId,
        OPT_DD_FILENAME: join(commitPath, a.relativeFilePath),
        OPT_GPG_KEY: gpgKey,
        OPT_S3_BUCKET: s3Bucket
    };

}

export default function getCommittedToUploadedCommittedMapFunc(
    rootPath: AbsoluteDirectoryPath,
    commitPath: AbsoluteDirectoryPath,
    s3Bucket: S3BucketName,
    gpgKey: GpgKey,
    cmd: CommandName
    // TODO: Pass in CmdSpawner
): MapFunc<Committed, UploadedCommitted> {
    let cmdSpawner = CmdRunner.getCmdSpawner();

    return function(a: Committed, cb) {

        let cmdRunner = new CmdRunner(
            { cmdSpawner },
            Object.assign({}, process.env, getEnv(gpgKey, s3Bucket, rootPath, commitPath, a)),
            ".",
            cmd,
            [],
            {}
        );

        let sdc = streamDataCollector(cmdRunner)
            .then((lines) => {
                cb(null, assoc('result', { exitStatus: 0, output: lines }, a));
            })
            .catch((err) => {
                cb(err); // TODO: What do we need to do here to make sure that
                         // errors are readable by an end user?
            });

    };
}

