"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const Types_1 = require("../src/Types");
const streamdash_1 = require("streamdash");
const ramda_1 = require("ramda");
const UploadedS3FilePartsToCommit_1 = require("../src/UploadedS3FilePartsToCommit");
let modifiedDate = new Date("2017-06-19T06:20:05.168Z");
let commitDates = [
    new Date("2017-07-18T07:30:00.000Z"),
    new Date("2017-07-18T07:32:00.000Z"),
    new Date("2017-07-18T07:34:00.000Z"),
    new Date("2017-07-18T07:36:00.000Z"),
    new Date("2017-07-18T07:38:00.000Z"),
    new Date("2017-07-18T07:40:00.000Z"),
    new Date("2017-07-18T07:42:00.000Z"),
    new Date("2017-07-18T07:44:00.000Z"),
    new Date("2017-07-18T07:46:00.000Z"),
    new Date("2017-07-18T07:48:00.000Z"),
    new Date("2017-07-18T07:50:00.000Z"),
    new Date("2017-07-18T07:52:00.000Z"),
    new Date("2017-07-18T07:54:00.000Z")
];
function getFileParts(low, high, count) {
    let template = {
        gpgKey: 'g',
        sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
        fileByteCount: 1200,
        filePartByteCountThreshold: 1024,
        length: 100,
        part: [22, 152],
        uploadAlreadyExists: false,
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
                        'aws s3 cp - "s3://ebak-bucket/c-def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf-022-1K.ebak"'
                }]
        }
    };
    let f = ramda_1.pipe(ramda_1.range(low - 1), ramda_1.map((i) => { return [i + 1, count]; }), ramda_1.map((range) => ramda_1.assoc('part', range, template)));
    return f(high);
}
function getTransactionIdGenerator() {
    let jj = 1;
    return function () {
        let s = "" + (jj++);
        while (s.length < 3) {
            s = "0" + s;
        }
        return s;
    };
}
ava_1.default("Will error if a non-zero exit code is there (should never be)", (tst) => {
    let getGetDate = function () {
        let i = 0;
        return () => commitDates[i++];
    };
    let input = ramda_1.adjust(ramda_1.assoc('result', { exitStatus: 1 }), 3, getFileParts(22, 25, 152));
    let src = new streamdash_1.ArrayReadable(input);
    let trn = new UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit({
        getDate: getGetDate(),
        interval: (f) => { return () => { }; },
        commitIdGenerator: getTransactionIdGenerator()
    }, "ClientId", 'gg', 2048, 1000 * 120, {});
    src.pipe(trn);
    return streamdash_1.streamDataCollector(trn)
        .then((commits) => {
        tst.fail("The exit code of 1 should have caused failure");
    })
        .catch(e => {
        tst.pass();
    });
});
ava_1.default("Will output at filesize threshold and flush", (tst) => {
    let getGetDate = function () {
        let i = 0;
        return () => commitDates[i++];
    };
    let input = getFileParts(21, 24, 152);
    input[0] = ramda_1.assoc('uploadAlreadyExists', true, input[0]);
    let src = new streamdash_1.ArrayReadable(input);
    let trn = new UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit({
        getDate: getGetDate(),
        interval: (f) => { return () => { }; },
        commitIdGenerator: getTransactionIdGenerator()
    }, "ClientId", 'gg', 2048, 1000 * 120, {});
    src.pipe(trn);
    let expected = [
        {
            record: [
                {
                    gpgKey: 'g',
                    filePartByteCountThreshold: 1024,
                    sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
                    operation: Types_1.Operation.Create,
                    fileByteCount: 1200,
                    modifiedDate,
                    path: "//error_command",
                    part: [22, 152],
                },
                {
                    gpgKey: 'g',
                    filePartByteCountThreshold: 1024,
                    sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
                    operation: Types_1.Operation.Create,
                    fileByteCount: 1200,
                    modifiedDate,
                    path: "//error_command",
                    part: [23, 152],
                }
            ],
            gpgKey: 'gg',
            createdAt: commitDates[1],
            commitId: "001",
            clientId: "ClientId",
        },
        {
            record: [
                {
                    gpgKey: 'g',
                    filePartByteCountThreshold: 1024,
                    sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
                    operation: Types_1.Operation.Create,
                    fileByteCount: 1200,
                    modifiedDate,
                    path: "//error_command",
                    part: [24, 152],
                }
            ],
            gpgKey: 'gg',
            createdAt: commitDates[3],
            commitId: "002",
            clientId: "ClientId",
        }
    ];
    return streamdash_1.streamDataCollector(trn)
        .then((commits) => {
        tst.deepEqual(commits, expected);
        return true;
    })
        .catch(e => {
        tst.fail(e.message);
    });
});
ava_1.default("Will output at time threshold and flush", (tst) => {
    let getGetDate = function () {
        let i = 0;
        return () => commitDates[i++];
    };
    let intervalCb = () => { };
    let input = getFileParts(20, 24, 152);
    let src = new streamdash_1.ArrayReadable(input);
    let trn = new UploadedS3FilePartsToCommit_1.UploadedS3FilePartsToCommit({
        getDate: getGetDate(),
        interval: (f) => {
            intervalCb = f;
            return () => { };
        },
        commitIdGenerator: getTransactionIdGenerator()
    }, "ClientId", 'gg', 81920, 1000 * 120, { highWaterMark: 1 });
    let mapper = (a, c) => {
        intervalCb();
        c(null, a);
    };
    let eventer = new streamdash_1.MapTransform(mapper, { objectMode: true, highWaterMark: 1 });
    src.pipe(eventer).pipe(trn);
    return streamdash_1.streamDataCollector(trn)
        .then((commits) => {
        let parts = ramda_1.reduce((acc, commit) => {
            return acc.concat(commit.record.map(({ part }) => part));
        }, [], commits);
        tst.deepEqual(parts, [[20, 152], [21, 152], [22, 152], [23, 152], [24, 152]]);
        tst.true(commits.length > 1); // because of big fileByteCountThreshold
        // it must be breaking by time. This
        // is probably not the perfect test but
        // we know we don't loose data and it
        // is breaking by time, so better than
        // nothing... I found this bit quite
        // difficult to test.
        return true;
    })
        .catch(e => {
        tst.fail(e.message);
    });
});
// TODO: Test that the timer is cancelled!
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkZWRTM0ZpbGVQYXJ0c1RvQ29tbWl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9VcGxvYWRlZFMzRmlsZVBhcnRzVG9Db21taXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUI7QUFDdkIsd0NBQThGO0FBQzlGLDJDQUE4RTtBQUM5RSxpQ0FBZ0U7QUFDaEUsb0ZBQWlGO0FBRWpGLElBQUksWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDeEQsSUFBSSxXQUFXLEdBQUc7SUFDZCxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNwQyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztDQUN2QyxDQUFDO0FBR0Ysc0JBQXNCLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSztJQUVsQyxJQUFJLFFBQVEsR0FBdUI7UUFDL0IsTUFBTSxFQUFFLEdBQUc7UUFDWCxNQUFNLEVBQUUsa0VBQWtFO1FBQzFFLGFBQWEsRUFBRSxJQUFJO1FBQ25CLDBCQUEwQixFQUFFLElBQUk7UUFDaEMsTUFBTSxFQUFFLEdBQUc7UUFDWCxJ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