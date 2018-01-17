import test from 'ava';
import { Operation, Filename, BackupRecord, Commit, File } from '../src/Types';
import getLocallyDeletedFilesRightAfterLeftMapFunc from '../src/getLocallyDeletedFilesRightAfterLeftMapFunc';
import { map } from 'ramda';


test("Can join based on files missing / out of date in db", (tst) => {

    let backupRecords: BackupRecord[] = [
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'ef2', operation: Operation.Create, fileByteCount: 58, modifiedDate: new Date('2017-06-24T10:46:12.000Z'), path: 'error_command', part: [1, 1] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '8cf', operation: Operation.Create, fileByteCount: 29, modifiedDate: new Date('2017-06-25T14:47:13.000Z'), path: 'hello_command', part: [2, 3] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'def', operation: Operation.Create, fileByteCount: 1816, modifiedDate: new Date('2017-06-19T06:20:05.000Z'), path: 'bye_command', part: [1, 1] }
        ],
        rightCommit: Commit = {
            gpgKey: 'gpg-key',
            clientId: 'fozz-client',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'rusdc000',
            record: backupRecords
        };


    let leftFileData: File[] = [
        { path: "error_command", fileByteCount: 58, modifiedDate: new Date("2017-06-24T10:46:12.432Z") },
        { path: "hello_command", fileByteCount: 29, modifiedDate: new Date("2017-06-26T14:47:13.856Z") },
        { path: "another_file", fileByteCount: 1, modifiedDate: new Date("2017-06-26T14:47:13.856Z") }
    ];

    let expected: Filename[][] = [[{
        path: "bye_command"
    }]];

    let locallyDeletedRLMF = getLocallyDeletedFilesRightAfterLeftMapFunc({});

    let result: Filename[][] = map(
        locallyDeletedRLMF.bind(null, leftFileData),
        [rightCommit],
    );

    tst.deepEqual(result, expected);

    let result2: Filename[][] = map(
        locallyDeletedRLMF.bind(null, leftFileData),
        [rightCommit],
    );

    // It should only output a deleted file once.
    tst.deepEqual(result2, [[]]);

});

