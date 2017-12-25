import test from 'ava';
import { Filename, BackupCheckDatabase, File } from '../src/Types';
import getLocallyDeletedFilesRightAfterLeftMapFunc from '../src/getLocallyDeletedFilesRightAfterLeftMapFunc';
import { map } from 'ramda';


test("Can join based on files missing / out of date in db", (tst) => {

    let rightDbData: BackupCheckDatabase[] = [{
        "error_command": [{
            "modifiedDate": new Date("2017-06-24T10:46:12.432Z"),
            "fileByteCount": 58 ,
            "commitId": "a",
            "sha256": "ef28ddadd99fbab0f8ff875df2051b6d6061a660ab72b7b33cf45b28fb3d8098"
        }],
        "hello_command": [{
            "modifiedDate": new Date("2017-06-25T14:47:13.856Z") ,
            "commitId": "a",
            "fileByteCount": 29,
            "sha256": "8cf0f7cceaf3e0cc1d575000f305b2d10fdb6c5d35e5007496b8589e0d7046bb"
        }],
        "bye_command": [{
            "modifiedDate": new Date("2017-06-27T14:47:13.856Z") ,
            "commitId": "a",
            "fileByteCount": 29,
            "sha256": "8cf0f7cceaf3e0cc1d575000f305b2d10fdb6c5d35e5007496b8589e0d7046bb"
        }]
    }];

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
        rightDbData,
    );

    tst.deepEqual(result, expected);

});

