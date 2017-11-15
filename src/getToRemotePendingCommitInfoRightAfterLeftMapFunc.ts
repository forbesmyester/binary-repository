import { map, assoc } from 'ramda';
import { RightAfterLeftMapFunc } from 'streamdash';
import { BackupCheckDatabaseValue, BackupCheckDatabase, RemotePendingCommit, RemotePendingCommitInfo, RemotePendingCommitInfoRecord } from './Types';
import { last } from 'ramda';

export interface Dependencies {}

function excl(i: BackupCheckDatabaseValue) {
    let r = Object.assign({}, i);
    delete r.commitId;
    return r;
}

export default function getToRemotePendingCommitInfoRightAfterLeftMapFunc(dependencies: Dependencies): RightAfterLeftMapFunc<BackupCheckDatabase, RemotePendingCommit, RemotePendingCommitInfo> {

    return function(dbs, rpc) {

        if (dbs.length === 0) { dbs = [{}]; }
        if (dbs.length !== 1) {
            throw new Error("Was expecting only one BackupCheckDatabase");
        }

        let db = dbs[0];

        let record = map(
            (record): RemotePendingCommitInfoRecord => {
                if (!db.hasOwnProperty(record.path)) {
                    return assoc('local', null, record);
                }
                return assoc('local', excl(last(db[record.path])), record);
            },
            rpc.record
        );

        return [assoc('record', record, rpc)];
    };

}
