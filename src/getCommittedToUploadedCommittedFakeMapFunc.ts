import { UploadedCommitted, CommitId, ClientId, Committed, AbsoluteFilePath, AbsoluteDirectoryPath, GpgKey, DdBs, S3BucketName, CommandName } from  './Types';
import { join } from 'path';
import { ExitStatus, CmdOutput, CmdSpawner, CmdRunner } from './CmdRunner';
import { MapFunc, streamDataCollector, Transform } from 'streamdash';
import {} from "./UploadedS3FilePartsToCommit";
import { assoc } from 'ramda';

export default function getCommittedToUploadedCommittedMapFunc(
    commitPath: AbsoluteDirectoryPath,
    s3Bucket: S3BucketName,
    gpgKey: GpgKey,
    cmd: CommandName
    // TODO: Pass in CmdSpawner
): MapFunc<Committed, UploadedCommitted> {

    return function(a: Committed, cb) {

        cb(null, assoc('result', { exitStatus: 0, output: [] }, a));
    };

}

