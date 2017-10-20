import { MapFunc } from 'streamdash';
import { CmdSpawner } from './CmdRunner';
import { Callback, AbsoluteFilePath, AbsoluteDirectoryPath, S3BucketName, GpgKey, CommandName, Filename, CommitFilename, CmdResult } from '../src/Types';
export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error | null) => void): void;
}
export interface Dependencies {
    cmdSpawner: CmdSpawner;
    rename: (src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
}
export declare function getDependencies(): Dependencies;
export declare type RemotePendingCommitCmdResult = CommitFilename & {
    result: CmdResult;
};
export default function getRepositoryCommitToRemoteCommitMapFunc(dependencies: Dependencies, configDir: AbsoluteDirectoryPath, s3Bucket: S3BucketName, gpgKey: GpgKey, cmd: CommandName): MapFunc<Filename, RemotePendingCommitCmdResult>;
