import { ScanFunc } from 'streamdash';
import { BackupRecord, Callback2, Commit, BackupCheckDatabaseValue, BackupCheckDatabase } from '../src/Types';
import { over, lensPath, append, set, reduce } from 'ramda';

export interface Dependencies {
}

function recordToBackupCheckDatabaseValue(a: Commit, r: BackupRecord): BackupCheckDatabaseValue {
    return {
        modifiedDate: r.modifiedDate,
        fileByteCount: r.fileByteCount,
        sha256: r.sha256,
        commitId: a.commitId
    }
}

export default function getCommitToBackupCheckDatabaseScanFunc(dependencies: Dependencies): ScanFunc<Commit, BackupCheckDatabase> {

    return function getCommitToBackupCheckDatabaseScanFunc(input: BackupCheckDatabase, a: Commit, next: Callback2<BackupCheckDatabase>): void {
        let partDb: BackupCheckDatabase = reduce(
            (acc, record): BackupCheckDatabase => {
                if (record.part[0] == record.part[1]) {
                    let lens = lensPath([record.path]);
                    let val = recordToBackupCheckDatabaseValue(
                        a,
                        record
                    );
                    if (!acc.hasOwnProperty(record.path)) {
                        return set(
                            lens,
                            <BackupCheckDatabaseValue[]>[val],
                            acc
                        );
                    }
                    return over(lens, append(val), acc);
                }
                return acc;
            },
            <BackupCheckDatabase>input,
            a.record
        );
        next(null, partDb);
    };

}

