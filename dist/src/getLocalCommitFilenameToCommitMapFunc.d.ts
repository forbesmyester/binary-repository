import { MapFunc } from 'streamdash';
import { Callback2, CommitFilename, Commit, AbsoluteDirectoryPath } from '../src/Types';
export interface Dependencies {
    readFile(path: string, opts: {
        encoding: string;
    }, cb: Callback2<string>): any;
}
export default function ({readFile}: Dependencies, configDir: AbsoluteDirectoryPath): MapFunc<CommitFilename, Commit>;
