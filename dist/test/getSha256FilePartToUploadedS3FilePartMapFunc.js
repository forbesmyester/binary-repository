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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0U2hhMjU2RmlsZVBhcnRUb1VwbG9hZGVkUzNGaWxlUGFydE1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0L2dldFNoYTI1NkZpbGVQYXJ0VG9VcGxvYWRlZFMzRmlsZVBhcnRNYXBGdW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQXVCO0FBQ3ZCLGlDQUE4QjtBQUM5QixzSEFBdUk7QUFDdkksc0hBQStHO0FBQy9HLHdDQUE4RTtBQUU5RSxhQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUV4QyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBRXhELElBQUksS0FBSyxHQUFtQjtRQUNwQixNQUFNLEVBQUUsTUFBTTtRQUNkLGFBQWEsRUFBRSxFQUFFO1FBQ2pCLDBCQUEwQixFQUFFLElBQUk7UUFDaEMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztRQUNmLE1BQU0sRUFBRSxFQUFFO1FBQ1YsTUFBTSxFQUFFLEVBQUU7UUFDVixZQUFZO1FBQ1osSUFBSSxFQUFFLGlCQUFpQjtRQUN2QixNQUFNLEVBQUUsSUFBSTtLQUNmLENBQUM7SUFHTixJQUFJLFFBQVEsR0FBc0M7UUFDdEMsV0FBVyxFQUFFLEVBQUU7UUFDZixTQUFTLEVBQUUsQ0FBQztRQUNaLFlBQVksRUFBRSxFQUFFO1FBQ2hCLGVBQWUsRUFBRSxzQkFBc0I7UUFDdkMsV0FBVyxFQUFFLENBQUM7UUFDZCxXQUFXLEVBQUUsWUFBWTtRQUN6QixhQUFhLEVBQUUsYUFBYTtRQUM1QixhQUFhLEVBQUUsa0NBQWtDO0tBQ3hELENBQUM7SUFHTixJQUFJLElBQUksR0FBRyxzREFBNEMsQ0FDbkQsOERBQWUsQ0FBQyxrQkFBVSxDQUFDLFdBQVcsQ0FBQyxFQUN2QyxRQUFRLEVBQ1IsYUFBYSxFQUNiLFlBQVksRUFDWixJQUFJLEVBQ0oscUJBQXFCLENB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