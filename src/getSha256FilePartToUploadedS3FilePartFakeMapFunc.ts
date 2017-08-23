import { AbsoluteDirectoryPath, GpgKey, Sha256FilePart, S3BucketName, CommandName, UploadedS3FilePart } from  './Types';
import { MapFunc } from 'streamdash';
import { assoc } from 'ramda';

export default function getSha256FilePartToUploadedS3FilePartFakeMapFunc(rootPath: AbsoluteDirectoryPath, s3Bucket: S3BucketName, gpgKey: GpgKey, cmd: CommandName): MapFunc<Sha256FilePart, UploadedS3FilePart> {

    return (a: Sha256FilePart, cb) => {
        cb(null, assoc('result', { exitStatus: 0, output: [] }, a));
    };

}
