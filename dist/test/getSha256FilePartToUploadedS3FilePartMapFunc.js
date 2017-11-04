"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const ramda_1 = require("ramda");
const getSha256FilePartToUploadedS3FilePartMapFunc_1 = require("../src/getSha256FilePartToUploadedS3FilePartMapFunc");
const getSha256FilePartToUploadedS3FilePartMapFunc_2 = require("../src/getSha256FilePartToUploadedS3FilePartMapFunc");
const Types_1 = require("../src/Types");
ava_1.default("Generate Environment (base)", (tst) => {
    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");
    let input = {
        sha256: "def8",
        fileByteCount: 58,
        filePartByteCountThreshold: 1024,
        part: [22, 152],
        offset: 32,
        length: 12,
        modifiedDate,
        path: "//error_command",
        isLast: true
    };
    let expected = {
        OPT_DD_SKIP: 32,
        OPT_DD_BS: 1,
        OPT_DD_COUNT: 12,
        OPT_DD_FILENAME: "/tmp/x/error_command",
        OPT_IS_LAST: 0,
        OPT_GPG_KEY: "my-gpg-key",
        OPT_S3_BUCKET: "ebak-bucket",
        OPT_S3_OBJECT: 'f-def8-022-1KB-my--gpg--key.ebak'
    };
    let inst = getSha256FilePartToUploadedS3FilePartMapFunc_2.default(getSha256FilePartToUploadedS3FilePartMapFunc_1.getDependencies(Types_1.RemoteType.LOCAL_FILES), '/tmp/x', 'ebak-bucket', 'my-gpg-key', 1024, 'bash/test-upload-s3');
    tst.deepEqual(inst.getEnv(1024, input), expected);
});
ava_1.default("Generate Environment (last)", (tst) => {
    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");
    let input = {
        sha256: "def8",
        fileByteCount: 1222,
        filePartByteCountThreshold: 1024,
        part: [152, 152],
        offset: 1111,
        length: -1,
        modifiedDate,
        path: "//error_command",
        isLast: true
    };
    let expected = {
        OPT_DD_SKIP: 1111,
        OPT_DD_BS: 1,
        OPT_DD_COUNT: -1,
        OPT_DD_FILENAME: "/tmp/x/error_command",
        OPT_IS_LAST: 1,
        OPT_GPG_KEY: "my-gpg-key",
        OPT_S3_BUCKET: "ebak-bucket",
        OPT_S3_OBJECT: 'f-def8-152-1KB-my--gpg--key.ebak'
    };
    let inst = getSha256FilePartToUploadedS3FilePartMapFunc_2.default(getSha256FilePartToUploadedS3FilePartMapFunc_1.getDependencies(Types_1.RemoteType.LOCAL_FILES), '/tmp/x', 'ebak-bucket', 'my-gpg-key', 1024, 'bash/test-upload-s3');
    tst.deepEqual(inst.getEnv(1024, input), expected);
});
ava_1.default.cb("Can run a command", (tst) => {
    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");
    let input = {
        sha256: "def8",
        fileByteCount: 1222,
        filePartByteCountThreshold: 1024,
        part: [22, 152],
        offset: 1111,
        length: 100,
        modifiedDate,
        path: "//error_command",
        isLast: true
    };
    let expected = {
        gpgKey: 'my-gpg-key',
        sha256: "def8",
        fileByteCount: 1222,
        filePartByteCountThreshold: 1024,
        length: 100,
        part: [22, 152],
        offset: 1111,
        modifiedDate,
        path: "//error_command",
        isLast: true,
        uploadAlreadyExists: false,
        result: {
            exitStatus: 0,
            output: [{
                    name: 'stdout',
                    text: 'dd if="/tmp/x/error_command" bs="1" skip="1111" count="100" | ' +
                        'gpg -e -r "my-gpg-key" | ' +
                        'aws s3 cp - "s3://ebak-bucket/f-def8-022-1KB-my--gpg--key.ebak"'
                }]
        }
    };
    let calledExists = false;
    let dependencies = ramda_1.assoc('exists', (f, n) => {
        calledExists = true;
        tst.deepEqual(f, ['ebak-bucket', "f-def8-022-1KB-my--gpg--key.ebak"]);
        n(null, false);
    }, getSha256FilePartToUploadedS3FilePartMapFunc_1.getDependencies(Types_1.RemoteType.LOCAL_FILES));
    let trn = getSha256FilePartToUploadedS3FilePartMapFunc_2.default(dependencies, '/tmp/x', 'ebak-bucket', 'my-gpg-key', 1024, 'bash/test-upload-s3');
    trn(input, (err, output) => {
        tst.is(err, null);
        tst.is(calledExists, true);
        tst.deepEqual(output, expected);
        tst.end();
    });
});
ava_1.default.cb("Will not run a command if already exists", (tst) => {
    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");
    let input = {
        sha256: "def8",
        fileByteCount: 1222,
        filePartByteCountThreshold: 1024,
        part: [22, 152],
        offset: 1111,
        length: 100,
        modifiedDate,
        path: "//error_command",
        isLast: true
    };
    let expected = {
        gpgKey: 'my-gpg-key',
        sha256: "def8",
        fileByteCount: 1222,
        filePartByteCountThreshold: 1024,
        length: 100,
        part: [22, 152],
        offset: 1111,
        modifiedDate,
        path: "//error_command",
        isLast: true,
        uploadAlreadyExists: true,
        result: {
            exitStatus: 0,
            output: []
        }
    };
    let calledExists = false;
    let dependencies = {
        exists: (f, n) => {
            calledExists = true;
            tst.deepEqual(f, ['ebak-bucket', "f-def8-022-1KB-my--gpg--key.ebak"]);
            n(null, true);
        },
        cmdSpawner: () => { throw new Error("Not here"); }
    };
    let trn = getSha256FilePartToUploadedS3FilePartMapFunc_2.default(dependencies, '/tmp/x', 'ebak-bucket', 'my-gpg-key', 1024, 'bash/test-upload-s3');
    trn(input, (err, output) => {
        tst.is(err, null);
        tst.is(calledExists, true);
        tst.deepEqual(output, expected);
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0U2hhMjU2RmlsZVBhcnRUb1VwbG9hZGVkUzNGaWxlUGFydE1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0L2dldFNoYTI1NkZpbGVQYXJ0VG9VcGxvYWRlZFMzRmlsZVBhcnRNYXBGdW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQXVCO0FBQ3ZCLGlDQUE4QjtBQUM5QixzSEFBdUk7QUFDdkksc0hBQStHO0FBQy9HLHdDQUE4RTtBQUU5RSxhQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxHQUFHO0lBRXBDLElBQUksWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFFeEQsSUFBSSxLQUFLLEdBQW1CO1FBQ3BCLE1BQU0sRUFBRSxNQUFNO1FBQ2QsYUFBYSxFQUFFLEVBQUU7UUFDakIsMEJBQTBCLEVBQUUsSUFBSTtRQUNoQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDO1FBQ2YsTUFBTSxFQUFFLEVBQUU7UUFDVixNQUFNLEVBQUUsRUFBRTtRQUNWLFlBQVk7UUFDWixJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLE1BQU0sRUFBRSxJQUFJO0tBQ2YsQ0FBQztJQUdOLElBQUksUUFBUSxHQUFzQztRQUN0QyxXQUFXLEVBQUUsRUFBRTtRQUNmLFNBQVMsRUFBRSxDQUFDO1FBQ1osWUFBWSxFQUFFLEVBQUU7UUFDaEIsZUFBZSxFQUFFLHNCQUFzQjtRQUN2QyxXQUFXLEVBQUUsQ0FBQztRQUNkLFdBQVcsRUFBRSxZQUFZO1FBQ3pCLGFBQWEsRUFBRSxhQUFhO1FBQzVCLGFBQWEsRUFBRSxrQ0FBa0M7S0FDeEQsQ0FBQztJQUdOLElBQUksSUFBSSxHQUFHLHNEQUE0QyxDQUNuRCw4REFBZSxDQUFDLGtCQUFVLENBQUMsV0FBVyxDQUFDLEVBQ3ZDLFFBQVEsRUFDUixhQUFhLEVBQ2IsWUFBWSxFQUNaLElBQUksRUFDSixxQkFBcUIsQ0FDeEIsQ0FBQztJ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