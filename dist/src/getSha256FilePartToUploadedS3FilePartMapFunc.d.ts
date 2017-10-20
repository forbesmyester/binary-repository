import { S3Object, RemoteType, S3Location, Callback, AbsoluteFilePath, AbsoluteDirectoryPath, GpgKey, Sha256FilePart, S3BucketName, CommandName, UploadedS3FilePart } from './Types';
import { MapFunc } from 'streamdash';
import { CmdSpawner } from './CmdRunner';
/**
 * The environment to pass when executing the command to segment, encrypt and
 * upload to S3
 */
export interface Sha256FilePartUploadS3Environment {
    OPT_DD_SKIP: number;
    OPT_DD_BS: number;
    OPT_DD_COUNT: number;
    OPT_DD_FILENAME: AbsoluteFilePath;
    OPT_IS_LAST: number;
    OPT_GPG_KEY: GpgKey;
    OPT_S3_BUCKET: S3BucketName;
    OPT_S3_OBJECT: S3Object;
}
export interface MapFuncWithGetEnv<I, O> extends MapFunc<I, O> {
    getEnv(filePartByteCountThreshold: number, a: Sha256FilePart): Sha256FilePartUploadS3Environment;
}
export interface Dependencies {
    cmdSpawner: CmdSpawner;
    exists: (loc: S3Location, next: Callback<boolean>) => void;
}
export declare function getDependencies(rt: RemoteType): Dependencies;
export default function getSha256FilePartToUploadedS3FilePartMapFunc({cmdSpawner, exists}: Dependencies, rootPath: AbsoluteDirectoryPath, s3Bucket: S3BucketName, gpgKey: GpgKey, filePartByteCountThreshold: number, cmd: CommandName): MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart>;
