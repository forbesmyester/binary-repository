import {  Callback, RemotePendingCommitInfo, RemotePendingCommitInfoRecord, RemotePendingCommitStat, RemotePendingCommitStatRecord, AbsoluteFilePath, AbsoluteDirectoryPath } from '../src/Types';
import { asyncMap, MapFunc } from 'streamdash';
import { assoc } from 'ramda';
import { Stats } from 'fs';
import { join } from 'path';
import {} from './Types';

export interface Dependencies {
    stat: (f: string, cb: (err: NodeJS.ErrnoException, stats: Stats) => void) => void;
}

export default function getToRemotePendingCommitStatsMapFunc({ stat }, rootPath: AbsoluteDirectoryPath): MapFunc<RemotePendingCommitInfo, RemotePendingCommitStat> {

    function worker(
        rec: RemotePendingCommitInfoRecord,
        next: Callback<RemotePendingCommitStatRecord>
    ) {
        let fullPath: AbsoluteFilePath = join(rootPath, rec.path);
        stat(fullPath, (e, s) => {
            if (e) { return next(e); }
            next(
                null,
                assoc(
                    'stat',
                    {
                        fileByteCount: s.size,
                        modifiedDate: s.mtime
                    },
                    rec
                )
            );
        });
    }


    return (rpci: RemotePendingCommitInfo, next) => {

        asyncMap(worker, rpci.record, (err, results) => {

            if (err) { return next(err); }

            if ((results === undefined) || (results.length !== rpci.record.length)) {
                throw new Error("Somehow getToRemotePendingCommitStatsMapFunc did not fail but did not return a consistent result");
            }

            next(
                null,
                assoc('record', results, rpci)
            );
        });


    };

}

