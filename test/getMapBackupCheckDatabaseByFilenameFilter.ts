import test from 'ava';
import { getFilenameFilter } from '../src/getMapBackupCheckDatabaseByFilenameFilter';
import getMf from '../src/getMapBackupCheckDatabaseByFilenameFilter';
import { BackupCheckDatabase } from '../src/Types';

test.cb("Can map", (tst) => {

    let input: BackupCheckDatabase = {
        'hello_command': [{ part: [1, 1], commitId: 'rusdc000', sha256: '8cf', modifiedDate: new Date('2017-06-25T14:47:13.856Z'), fileByteCount: 29 }],
        'my-projects/getTLIdEncoderDecoder.md': [{ part: [1, 1], commitId: 'rusdc000', sha256: 'def', modifiedDate: new Date('2017-06-19T06:20:05.168Z'), fileByteCount: 1816 }]
    };

    let expected: BackupCheckDatabase = {
        'hello_command': [{ part: [1, 1], commitId: 'rusdc000', sha256: '8cf', modifiedDate: new Date('2017-06-25T14:47:13.856Z'), fileByteCount: 29 }],
    };

    let mf = getMf({}, getFilenameFilter('he'));
    mf(input, (e, result) => {
        tst.deepEqual(result, expected);
        tst.end();
    });

});
