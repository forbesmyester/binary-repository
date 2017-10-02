import { RemotePendingCommitStatRecord, RemotePendingCommitStat, GpgKey, Callback, AbsoluteDirectoryPath, AbsoluteFilePath } from './Types';
import { MapFunc } from 'streamdash';
import { join } from 'path';
import * as mkdirp from 'mkdirp';
import { rename, unlink } from 'fs';
import { mapLimit, waterfall } from 'async';


export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}


export interface Dependencies {
    rename: (oldFn: AbsoluteFilePath, newFn: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
    unlink: (path: AbsoluteFilePath, next: Callback<void>) => void;
    decrypt: (gpgKey: GpgKey, tmpfile: AbsoluteFilePath, src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>) => void;
}

export default function getToFile({rename, mkdirp, unlink, decrypt}: Dependencies, configDir: AbsoluteDirectoryPath, rootDir: AbsoluteDirectoryPath): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat> {

    function process(rec: RemotePendingCommitStatRecord, next: Callback<RemotePendingCommitStatRecord>) {
        let tasks = [
            (next) => next(null, rec)
        ];
        waterfall(tasks, next);
    }

    return function(a: RemotePendingCommitStat, next: Callback<RemotePendingCommitStat>) {
        mapLimit(a.record, 3, process, (e, r) => {
        });
    };
}
