import myStat from './myStats';
import { RemotePendingCommitStatRecordStat, Callback, RemotePendingCommitInfo, RemotePendingCommitInfoRecord, RemotePendingCommitStat, RemotePendingCommitStatRecord, AbsoluteFilePath, AbsoluteDirectoryPath } from '../src/Types';
import { asyncMap, MapFunc } from 'streamdash';
import { assoc } from 'ramda';
import { CmdRunner } from './CmdRunner';
import { getRunner } from './getFileToSha256FileMapFunc';
import { stat } from 'fs';
import { Stats } from 'fs';
import { join } from 'path';
import { Sha256 } from './Types';


// export function getRunner({ cmdSpawner }: {cmdSpawner: CmdSpawner}) {
//     return singleLineCmdRunner({ cmdSpawner }, "sha256sum", /^([a-z0-9]{64})/);
// }

// export function getFileToSha256FileMapFunc({ runner }: { runner: MapFunc<AbsoluteFilePath, Sha256> }, rootPath: AbsoluteDirectoryPath): MapFunc<File, Sha256File> {


export interface Dependencies {
    stat: (f: string, cb: (err: null|NodeJS.ErrnoException, stats: Stats) => void) => void;
    runner: MapFunc<AbsoluteFilePath, Sha256>;
}


export function getDependencies(): Dependencies {

    let cmdSpawner = CmdRunner.getCmdSpawner({}),
    runner = getRunner({ cmdSpawner });

    return { stat, runner };
}

export default function getToRemotePendingCommitStatsMapFunc({ stat, runner }: Dependencies, rootPath: AbsoluteDirectoryPath): MapFunc<RemotePendingCommitInfo, RemotePendingCommitStat> {

    function addSha256(
        rec: RemotePendingCommitInfoRecord,
        statResult: RemotePendingCommitStatRecordStat,
        next: Callback<RemotePendingCommitStatRecord>
    ) {
        let fullPath: AbsoluteFilePath = join(rootPath, rec.path);
        runner(fullPath, (err, sha256) => {
            if (err) { return next(err); }
            let sr = assoc(
                'sha256',
                sha256,
                statResult
            );
            next(null, assoc('stat', sr, rec));
        });
    }

    function worker(
        rec: RemotePendingCommitInfoRecord,
        next: Callback<RemotePendingCommitStatRecord>
    ) {
        let fullPath: AbsoluteFilePath = join(rootPath, rec.path);
        myStat(stat, fullPath, (e, s) => {
            if (e) { return next(e); }
            if (s === null) {
                return next(null, assoc('stat', null, rec));
            }
            let result = {
                fileByteCount: s.size,
                modifiedDate: s.mtime
            };
            if (
                (result.fileByteCount == rec.fileByteCount) &&
                (result.modifiedDate != rec.modifiedDate)
            ) {
                return addSha256(rec, result, next);
            }
            next(null, assoc('stat', result, rec));
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

