/// <reference types="node" />
import { RemotePendingCommitInfo, RemotePendingCommitStat, AbsoluteFilePath, AbsoluteDirectoryPath } from '../src/Types';
import { MapFunc } from 'streamdash';
import { Stats } from 'fs';
import { Sha256 } from './Types';
export interface Dependencies {
    stat: (f: string, cb: (err: null | NodeJS.ErrnoException, stats: Stats) => void) => void;
    runner: MapFunc<AbsoluteFilePath, Sha256>;
}
export declare function getDependencies(): Dependencies;
export default function getToRemotePendingCommitStatsMapFunc({stat, runner}: Dependencies, rootPath: AbsoluteDirectoryPath): MapFunc<RemotePendingCommitInfo, RemotePendingCommitStat>;
