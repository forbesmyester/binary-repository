import { map, assoc } from 'ramda';
import { RightAfterLeftMapFunc } from 'streamdash';
import { BackupCheckDatabase, RemotePendingCommit, RemotePendingCommitInfo, RemotePendingCommitInfoRecord } from './Types';

export interface Dependencies {}

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
                return assoc('local', db[record.path], record);
            },
            rpc.record
        );

        return [assoc('record', record, rpc)];
    };

}
