import test from 'ava';
import { Operation, FilePartIndex, Callback, Commit, UploadedS3FilePart } from '../src/Types';
import { MapTransform, ArrayReadable, streamDataCollector } from 'streamdash';
import { adjust, reduce, assoc, map, pipe, range } from 'ramda';
import { UploadedS3FilePartsToCommit } from '../src/UploadedS3FilePartsToCommit';

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

    let template: UploadedS3FilePart = {
        sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
        fileByteCount: 600,
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
                'aws s3 cp - "s3://ebak-bucket/c-def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf-022.ebak"'
            }]
        }
    };

    let f = pipe(
        range(low - 1),
        map((i: number) => { return [i + 1, count]; }),
        map((range: [number, number]) => assoc('part', range, template))
    );

    return f(high);
}

function getTransactionIdGenerator() {
    let jj = 1;
    return function() {
        let s = "" + (jj++);
        while (s.length < 3) {
            s = "0" + s;
        }
        return s;
    };
}

test("Will error if a non-zero exit code is there (should never be)", (tst) => {

    let getGetDate = function() {
        let i = 0;
        return () => commitDates[i++];
    };

    let input = adjust(
        assoc('result', { exitStatus: 1 }),
        3,
        getFileParts(22, 25, 152)
    );
    let src = new ArrayReadable(input);
    let trn = new UploadedS3FilePartsToCommit(
        {
            getDate: getGetDate(),
            interval: (f) => { return () => {}; },
            commitIdGenerator: getTransactionIdGenerator()
        },
        "ClientId",
        1024,
        1000 * 120,
        {}
    );

    src.pipe(trn);

    return streamDataCollector<Commit>(trn)
        .then((commits) => {
            tst.fail("The exit code of 1 should have caused failure");
        })
        .catch(e => {
            tst.pass();
        });
});

test("Will output at filesize threshold and flush", (tst) => {

    let getGetDate = function() {
        let i = 0;
        return () => commitDates[i++];
    };

    let input = getFileParts(22, 24, 152);
    let src = new ArrayReadable(input);
    let trn = new UploadedS3FilePartsToCommit(
        {
            getDate: getGetDate(),
            interval: (f) => { return () => {}; },
            commitIdGenerator: getTransactionIdGenerator()
        },
        "ClientId",
        1024,
        1000 * 120,
        {}
    );

    src.pipe(trn);

    let expected: Commit[] = [
        {
            record: [
                {
                    sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
                    operation: Operation.Create,
                    fileByteCount: 600,
                    modifiedDate,
                    path: "//error_command",
                    part: [22, 152],
                },
                {
                    sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
                    operation: Operation.Create,
                    fileByteCount: 600,
                    modifiedDate,
                    path: "//error_command",
                    part: [23, 152],
                }
            ],
            createdAt: commitDates[1], // skips one on constructor
            commitId: "001",
            clientId: "ClientId",
        },
        {
            record: [
                {
                    sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
                    operation: Operation.Create,
                    fileByteCount: 600,
                    modifiedDate,
                    path: "//error_command",
                    part: [24, 152],
                }
            ],
            createdAt: commitDates[3], // skips one on flush
            commitId: "002",
            clientId: "ClientId",
        }
    ];

    return streamDataCollector<Commit>(trn)
        .then((commits) => {
            tst.deepEqual(commits, expected);
            return true;
        })
        .catch(e => {
            tst.fail(e.message);
        });
});

test("Will output at time threshold and flush", (tst) => {

    let getGetDate = function() {
        let i = 0;
        return () => commitDates[i++];
    };

    let intervalCb: Function = () => {};

    let input = getFileParts(20, 24, 152);
    let src = new ArrayReadable(input);
    let trn = new UploadedS3FilePartsToCommit(
        {
            getDate: getGetDate(),
            interval: (f) => {
                intervalCb = f;
                return () => {};
            },
            commitIdGenerator: getTransactionIdGenerator()
        },
        "ClientId",
        81920,
        1000 * 120,
        { highWaterMark: 1 }
    );

    let mapper = <A>(a: A, c: Callback<A>) => {
        intervalCb();
        c(null, a);
    };

    let eventer = new MapTransform(mapper, { objectMode: true, highWaterMark: 1 });

    src.pipe(eventer).pipe(trn);

    return streamDataCollector<Commit>(trn)
        .then((commits) => {
            let parts = reduce(
                (acc: FilePartIndex[], commit: Commit) => {
                    return acc.concat(commit.record.map(({part}) => part));
                },
                [],
                commits
            );
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
