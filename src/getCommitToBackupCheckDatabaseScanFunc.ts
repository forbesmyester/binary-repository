import { ScanFunc } from 'streamdash';
import { BackupRecord, Operation, Callback2, Commit, BackupCheckDatabase } from '../src/Types';
import { reduce, assoc, pick, merge } from 'ramda';

export interface Dependencies {
}

export default function({}: Dependencies): ScanFunc<Commit, BackupCheckDatabase> {

    return (acc: BackupCheckDatabase, a: Commit, next: Callback2<BackupCheckDatabase>): void => {
        let partDb: BackupCheckDatabase = reduce(
            (recordAcc, record): BackupCheckDatabase => {
                if (record.part[0] == record.part[1]) {
                    return assoc(
                        record.path,
                        pick(['modifiedDate', 'fileByteCount', 'sha256'], record),
                        recordAcc
                    );
                }
                return recordAcc;
            },
            <BackupCheckDatabase>{},
            a.record
        );
        next(null, merge(acc, partDb));
    };

}

