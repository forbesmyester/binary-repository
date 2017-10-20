import { UploadedCommitted, Committed, AbsoluteDirectoryPath, GpgKey, S3BucketName, CommandName } from './Types';
import { MapFunc } from 'streamdash';
export default function getCommittedToUploadedCommittedMapFunc(commitPath: AbsoluteDirectoryPath, s3Bucket: S3BucketName, gpgKey: GpgKey, cmd: CommandName): MapFunc<Committed, UploadedCommitted>;
