/// <reference types="node" />
import { AbsoluteDirectoryPath, File, Filename } from '../src/Types';
import { MapFunc } from 'streamdash';
import { Stats } from 'fs';
export interface Dependencies {
    stat: (f: string, cb: (err: NodeJS.ErrnoException, stats: Stats) => void) => void;
}
export declare function getFilenameToFileMapFunc({stat}: {
    stat: any;
}, rootPath: AbsoluteDirectoryPath): MapFunc<Filename, File>;
