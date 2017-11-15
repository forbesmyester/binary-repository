import test from 'ava';
import getCommitToBackupCheckDatabaseScanFunc from '../src/getCommitToBackupCheckDatabaseScanFunc';
import { BackupRecord, Operation, Commit, BackupCheckDatabaseValue, BackupCheckDatabase } from '../src/Types';
import { merge, mapObjIndexed } from 'ramda';

test.cb("Can buildCheckDatabase", (tst) => {

    let backupRecords1: BackupRecord[] = [
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'ef2', operation: Operation.Create, fileByteCount: 58, modifiedDate: new Date('2017-06-24T10:46:12.432Z'), path: 'error_command', part: [1, 1] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '8cf', operation: Operation.Create, fileByteCount: 29, modifiedDate: new Date('2017-06-25T14:47:13.856Z'), path: 'hello_command', part: [3, 3] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '999', operation: Operation.Create, fileByteCount: 33, modifiedDate: new Date('2017-06-25T14:47:13.856Z'), path: 'other_command', part: [2, 3] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'def', operation: Operation.Create, fileByteCount: 1816, modifiedDate: new Date('2017-06-19T06:20:05.168Z'), path: 'my-projects/getTLIdEncoderDecoder.md', part: [1, 1] }
        ],
        input1: Commit = {
            gpgKey: 'gg',
            clientId: 'fozz',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'rusdc000',
            record: backupRecords1
        },
        backupRecords2: BackupRecord[] = [
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'ef3', operation: Operation.Create, fileByteCount: 116, modifiedDate: new Date('2017-06-24T10:52:31.432Z'), path: 'error_command', part: [1, 1] },
        ],
        input2: Commit = {
            gpgKey: 'gg',
            clientId: 'fozz',
            createdAt: new Date('2017-07-22T17:03:18.966Z'),
            commitId: 'rutaa000',
            record: backupRecords2
        },
        expected: BackupCheckDatabase = {
            'error_command': [
                { commitId: 'rusdc000', sha256: 'ef2', modifiedDate: new Date('2017-06-24T10:46:12.432Z'), fileByteCount: 58 },
                { commitId: 'rutaa000', sha256: 'ef3', modifiedDate: new Date('2017-06-24T10:52:31.432Z'), fileByteCount: 116 },
            ],
            'hello_command': [{ commitId: 'rusdc000', sha256: '8cf', modifiedDate: new Date('2017-06-25T14:47:13.856Z'), fileByteCount: 29 }],
            'my-projects/getTLIdEncoderDecoder.md': [{ commitId: 'rusdc000', sha256: 'def', modifiedDate: new Date('2017-06-19T06:20:05.168Z'), fileByteCount: 1816 }]
        };

    let scanFunc = getCommitToBackupCheckDatabaseScanFunc({});

    function serialize(data: BackupCheckDatabase) {
        return mapObjIndexed(
            (vs: BackupCheckDatabaseValue[]) => {
                return vs.map(v => {
                    return merge(
                        v,
                        { modifiedDate: v.modifiedDate.toISOString() }
                    );
                });
            },
            data
        );
    }

    scanFunc({}, input1, (err, db1) => {
        tst.is(err, null);
        scanFunc(<BackupCheckDatabase>db1, input2, (err, db2) => {
            tst.is(err, null);
            tst.deepEqual(serialize(<BackupCheckDatabase>db2), serialize(expected));
            tst.end();
        });
    });
});

