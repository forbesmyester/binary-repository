import { Commit, Committed, AbsoluteDirectoryPath } from './Types';
import { AtomicFileWrite } from './atomicFileWrite';
import { MapFunc } from 'streamdash';
export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error | null) => void): void;
}
export interface Dependencies {
    atomicFileWrite: AtomicFileWrite;
    mkdirp: MkdirP;
}
export declare function getCommitToCommittedMapFuncDependencies(): Dependencies;
export declare function getCommitToCommittedMapFunc({atomicFileWrite, mkdirp}: Dependencies, configDir: AbsoluteDirectoryPath): MapFunc<Commit, Committed>;
