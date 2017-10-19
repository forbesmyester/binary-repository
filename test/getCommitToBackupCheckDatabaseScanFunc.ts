import test from 'ava';
import getCommitToBackupCheckDatabaseScanFunc from '../src/getCommitToBackupCheckDatabaseScanFunc';
import { BackupRecord, Operation, Callback, Commit, BackupCheckDatabaseValue, BackupCheckDatabase } from '../src/Types';
import { merge, mapObjIndexed } from 'ramda';

test.cb("Can buildCheckDatabase", (tst) => {

    let backupRecords: BackupRecord[] = [
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'ef2', operation: Operation.Create, fileByteCount: 58, modifiedDate: new Date('2017-06-24T10:46:12.432Z'), path: 'error_command', part: [1, 1] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '8cf', operation: Operation.Create, fileByteCount: 29, modifiedDate: new Date('2017-06-25T14:47:13.856Z'), path: 'hello_command', part: [3, 3] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '999', operation: Operation.Create, fileByteCount: 33, modifiedDate: new Date('2017-06-25T14:47:13.856Z'), path: 'other_command', part: [2, 3] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'def', operation: Operation.Create, fileByteCount: 1816, modifiedDate: new Date('2017-06-19T06:20:05.168Z'), path: 'my-projects/getTLIdEncoderDecoder.md', part: [1, 1] }
        ],
        input: Commit = {
            gpgKey: 'gg',
            clientId: 'fozz',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'rusdc000',
            record: backupRecords
        },
        expected: BackupCheckDatabase = {
            'error_command': { sha256: 'ef2', modifiedDate: new Date('2017-06-24T10:46:12.432Z'), fileByteCount: 58 },
            'hello_command': { sha256: '8cf', modifiedDate: new Date('2017-06-25T14:47:13.856Z'), fileByteCount: 29 },
            'my-projects/getTLIdEncoderDecoder.md': { sha256: 'def', modifiedDate: new Date('2017-06-19T06:20:05.168Z'), fileByteCount: 1816 }
        };

    let scanFunc = getCommitToBackupCheckDatabaseScanFunc({});

    function serialize(data: BackupCheckDatabase) {
        return mapObjIndexed(
            (v: BackupCheckDatabaseValue) => {
                return merge(v, { modifiedDate: v.modifiedDate.toISOString() });
            },
            data
        );
    }

    scanFunc({}, input, (err, db) => {
        tst.deepEqual(serialize(<BackupCheckDatabase>db), serialize(expected));
        tst.end();
    });
});

