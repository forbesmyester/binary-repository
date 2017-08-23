import test from 'ava';
import getCommittedToUploadedCommittedMapFunc from '../src/getCommittedToUploadedCommittedMapFunc';
import { MapFunc } from 'streamdash';
import { Committed, UploadedCommitted, Operation } from '../src/Types';
import { CmdOutput } from '../src/CmdRunner';

test.cb("Generate Environment (base)", (tst) => {

    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");

    let input: Committed = {
        record: [
            {
                sha256: "def8c",
                operation: Operation.Create,
                fileByteCount: 600,
                modifiedDate: new Date("2017-06-19T06:20:05.168Z"),
                path: "/error_command",
                part: [22, 152],
            },
            {
                sha256: "def8c",
                operation: Operation.Create,
                fileByteCount: 600,
                modifiedDate: new Date("2017-06-19T06:20:05.168Z"),
                path: "/error_command",
                part: [23, 152],
            },
            {
                sha256: "abc12",
                operation: Operation.Create,
                fileByteCount: 200,
                modifiedDate: new Date("2017-06-19T02:00:05.000Z"),
                path: "/test-file",
                part: [2, 5],
            }
        ],
        createdAt: new Date("2017-06-21:06:06.000Z"),
        commitId: "001",
        clientId: "ClientId",
        relativeFilePath: 'zzz001-ClientId.commit'
    };

    let expected: UploadedCommitted = Object.assign(
        {},
        input,
        {
            result: {
                exitStatus: 0,
                output: [{
                    name: 'stdout',
                    text: 'dd if="/tmp/x/.ebak/commits/zzz001-ClientId.commit" bs="1" skip="0" | gpg -e -r "ebak" | aws s3 cp - "s3://ebak-commit-bucket/c-001-ClientId.commit"'
                }]
            }
        }
    );


    let mapFunc = getCommittedToUploadedCommittedMapFunc(
        '/tmp/x', // TODO: This appears to not be required!
        '/tmp/x/.ebak/commits',
        'ebak-commit-bucket',
        'ebak',
        'bash/test-upload-commit-s3'
    );

    mapFunc(input, (err, result) => {
        tst.deepEqual(result, expected);
        tst.end();
    });



});
