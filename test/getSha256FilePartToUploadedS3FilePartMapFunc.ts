import test from 'ava';
import { Sha256FilePartUploadS3Environment } from '../src/getSha256FilePartToUploadedS3FilePartMapFunc';
import getSha256FilePartToUploadedS3FilePartMapFunc from '../src/getSha256FilePartToUploadedS3FilePartMapFunc';
import { Sha256FilePart, UploadedS3FilePart } from '../src/Types';

test("Generate Environment (base)", (tst) => {

    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");

    let input: Sha256FilePart = {
            sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
            fileByteCount: 58,
            part: [22, 152],
            offset: 32,
            length: 12,
            modifiedDate,
            path: "//error_command",
            isLast: true
        };


    let expected: Sha256FilePartUploadS3Environment = {
                OPT_SHA: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
                OPT_PART: "022",
                OPT_DD_SKIP: 32,
                OPT_DD_BS: 1,
                OPT_DD_COUNT: 12,
                OPT_DD_FILENAME: "/tmp/x/error_command",
                OPT_IS_LAST: 0,
                OPT_GPG_KEY: "ebak",
                OPT_S3_BUCKET: "ebak-bucket"
        };


    let inst = getSha256FilePartToUploadedS3FilePartMapFunc('/tmp/x', 'ebak-bucket', 'ebak', 'bash/test-upload-filepart-s3');

    tst.deepEqual(inst.getEnv(input), expected);

});

test("Generate Environment (last)", (tst) => {

    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");

    let input: Sha256FilePart = {
            sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
            fileByteCount: 1222,
            part: [152, 152],
            offset: 1111,
            length: -1,
            modifiedDate,
            path: "//error_command",
            isLast: true
        };


    let expected: Sha256FilePartUploadS3Environment = {
                OPT_SHA: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
                OPT_PART: "152",
                OPT_DD_SKIP: 1111,
                OPT_DD_BS: 1,
                OPT_DD_COUNT: -1,
                OPT_DD_FILENAME: "/tmp/x/error_command",
                OPT_IS_LAST: 1,
                OPT_GPG_KEY: "ebak",
                OPT_S3_BUCKET: "ebak-bucket"
        };

    let inst = getSha256FilePartToUploadedS3FilePartMapFunc('/tmp/x', 'ebak-bucket', 'ebak', 'bash/test-upload-filepart-s3');
    tst.deepEqual(inst.getEnv(input), expected);

});


test.cb("Can run a command", (tst) => {
    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");

    let input: Sha256FilePart = {
        sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
        fileByteCount: 1222,
        part: [22, 152],
        offset: 1111,
        length: 100,
        modifiedDate,
        path: "//error_command",
        isLast: true
    };


    let expected: UploadedS3FilePart = {
        sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
        fileByteCount: 1222,
        length: 100,
        part: [22, 152],
        offset: 1111,
        modifiedDate,
        path: "//error_command",
        isLast: true,
        result: {
            exitStatus: 0,
            output: [{
                name: 'stdout',
                text: 'dd if="/tmp/x/error_command" bs="1" skip="1111" count="100" | ' +
                'gpg -e -r "ebak" | ' +
                'aws s3 cp - "s3://ebak-bucket/f-def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf-022.ebak"'
            }]
        }
    };

    let trn = getSha256FilePartToUploadedS3FilePartMapFunc('/tmp/x', 'ebak-bucket', 'ebak',  'bash/test-upload-filepart-s3');

    trn(input, (err, output) => {
        tst.is(err, null);
        tst.deepEqual(output, expected);
        tst.end();
    });

});
