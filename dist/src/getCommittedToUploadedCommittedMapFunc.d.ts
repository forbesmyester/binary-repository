import { CommitFilename, Callback, AbsoluteFilePath, AbsoluteDirectoryPath, GpgKey, S3BucketName, CommandName } from './Types';
import { CmdSpawner } from './CmdRunner';
import { MapFunc } from 'streamdash';
export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error | null) => void): void;
}
export interface Dependencies {
    cmdSpawner: CmdSpawner;
    rename: (src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
}
export declare function getDependencies(): Dependencies;
export default function getCommittedToUploadedCommittedMapFunc({rename, cmdSpawner}: Dependencies, configDir: AbsoluteDirectoryPath, s3Bucket: S3BucketName, gpgKey: GpgKey, cmd: CommandName): MapFunc<CommitFilename, CommitFilename>;
