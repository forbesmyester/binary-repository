import { AbsoluteDirectoryPath, AbsoluteFilePath, RemotePendingCommitLocalInfo, RelativeFilePath, RemotePendingFileInfo, RemotePendingFileStats, RemotePendingCommitLocalStats, CommitId, ClientId, Callback } from './Types';
import { join } from 'path';
import { MapFunc, asyncMap } from 'streamdash';
import { dissoc, keys, pipe, assocPath, assoc, map, reduce, pick } from 'ramda';

interface RemotePendingFileInfoAr extends RemotePendingFileInfo {
    relativeFilePath: RelativeFilePath;
}

interface RemotePendingFileStatsAr extends RemotePendingFileStats {
    relativeFilePath: RelativeFilePath;
}

function mapFunc(cli: RemotePendingCommitLocalInfo): (k: RelativeFilePath) => RemotePendingFileInfoAr {
    return function(k) {
        return assoc('relativeFilePath', k, cli[k]);
    };
}

export interface Dependencies {
    fsStat: (path: AbsoluteFilePath, cb: (err: Error & { code: string }, d?: { mtime: Date }) => void) => void;
}

function getAddStats({fsStat}: Dependencies, rootDir) {
    return (a: RemotePendingFileInfoAr, next: Callback<RemotePendingFileStatsAr>) => {
        fsStat(join(rootDir, a.relativeFilePath), (err, data) => {
            if (err && err.hasOwnProperty('code') && (err.code == 'ENOENT')) {
                return next(null, assoc('localModificationDate', null, a));
            }
            if (err) { return next(err); }
            next(null, assoc('localModificationDate', (<{ mtime: Date }>data).mtime, a));
        });
    };
}

function toOb(ar: RemotePendingFileStatsAr[]): RemotePendingCommitLocalStats {
    return reduce(
        (acc, d: RemotePendingFileStatsAr) => {
            return assoc(
                d.relativeFilePath,
                dissoc('relativeFilePath', d),
                acc
            );
        },
        {},
        ar
    );
}

export default function getRemotePendingCommitLocalInfoToRemotePendingCommitLocalStatsMapFunc(dependencies: Dependencies, rootDir: AbsoluteDirectoryPath): MapFunc<
    RemotePendingCommitLocalInfo,
    RemotePendingCommitLocalStats> {

    return function remotePendingCommitLocalInfoToRemotePendingCommitLocalStatsMapFunc(i: RemotePendingCommitLocalInfo, next: Callback<RemotePendingCommitLocalStats>) {

        asyncMap(
            getAddStats(dependencies, rootDir),
            map(mapFunc(i), keys(i)),
            (err, data) => {
                if (err) { return next(err); }
                next(err, toOb(<RemotePendingFileStatsAr[]>data));
            }
        );


    };

}
