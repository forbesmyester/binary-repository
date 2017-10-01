import { S3Location, AbsoluteDirectoryPath, AbsoluteFilePath, ByteCount, Callback } from '../Types';

export default interface RepositoryLocalfiles {

    downloadSize(loc: S3Location, next: Callback<ByteCount>): void;

    download(tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>): void;

}
