import { RemotePendingCommitStatRecordDecided, S3Location, S3BucketName, S3Object, AbsoluteDirectoryPath, AbsoluteFilePath, ByteCount, Callback } from '../Types';

export default interface RepositoryLocalfiles {

    constructFilepartS3Location(s3Bucket: S3BucketName, maxFilepart: number, rec: RemotePendingCommitStatRecordDecided): S3Location;

    downloadSize(loc: S3Location, next: Callback<ByteCount>): void;

    download(tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>): void;

}
