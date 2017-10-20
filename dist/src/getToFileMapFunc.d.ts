import { RemotePendingCommitDownloaded, GpgKey, Callback, AbsoluteDirectoryPath, AbsoluteFilePath } from './Types';
import { MapFunc } from 'streamdash';
export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error | null) => void): void;
}
export declare function getDependencies(): Dependencies;
export interface Dependencies {
    utimes: (filename: AbsoluteFilePath, atime: number, mtime: number, next: Callback<void>) => void;
    rename: (oldFn: AbsoluteFilePath, newFn: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
    unlink: (path: AbsoluteFilePath, next: Callback<void>) => void;
    decrypt: (gpgKey: GpgKey, src: AbsoluteFilePath[], dst: AbsoluteFilePath, next: Callback<void>) => void;
}
export default function getToFile({utimes, rename, mkdirp, unlink, decrypt}: Dependencies, configDir: AbsoluteDirectoryPath, rootDir: AbsoluteDirectoryPath): MapFunc<RemotePendingCommitDownloaded, RemotePendingCommitDownloaded>;
