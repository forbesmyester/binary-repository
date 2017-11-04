"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const Types_1 = require("../src/Types");
const ramda_1 = require("ramda");
const getToRemotePendingCommitStatsMapFunc_1 = require("../src/getToRemotePendingCommitStatsMapFunc");
// TODO does this check sizes if modifiedDate is same?
function getResult(size, mtime) {
    return {
        isFile: () => true,
        isDirectory: () => true,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isSymbolicLink: () => false,
        isFIFO: () => false,
        isSocket: () => false,
        dev: -1,
        ino: -1,
        mode: -1,
        nlink: -1,
        uid: -1,
        gid: -1,
        rdev: -1,
        size: size,
        blksize: -1,
        blocks: -1,
        atime: new Date(),
        mtime: mtime,
        ctime: new Date(),
        birthtime: new Date(),
        birthtimeMs: 0,
        atimeMs: 0,
        mtimeMs: 0,
        ctimeMs: 0,
    };
}
ava_1.default.cb("Can map", (tst) => {
    function stat(filename, next) {
        let expectedFilenames = ['/tmp/abc.txt', '/tmp/def.txt'];
        tst.truthy(expectedFilenames.indexOf(filename) > -1);
        next(null, getResult(200, new Date("2018-09-09T17:27:22.730Z")));
    }
    function runner(filename, next) {
        let expectedFilenames = ['/tmp/def.txt'];
        tst.truthy(expectedFilenames.indexOf(filename) > -1);
        next(null, 'zzzSha');
    }
    let mf = getToRemotePendingCommitStatsMapFunc_1.default({ stat, runner }, '/tmp');
    let input = {
        clientId: 'notme',
        createdAt: new Date('2017-07-22T17:02:48.966Z'),
        commitId: 'b',
        gpgKey: 'commitGpgKey',
        record: [
            {
                sha256: '444',
                operation: Types_1.Operation.Create,
                fileByteCount: 400,
                modifiedDate: new Date('2018-09-09T17:27:22.730Z'),
                gpgKey: 'filepartGpgKey',
                filePartByteCountThreshold: 1024,
                path: 'abc.txt',
                part: [1, 1],
                local: null
            },
            {
                sha256: '444',
                operation: Types_1.Operation.Create,
                fileByteCount: 200,
                modifiedDate: new Date('2017-09-09T17:27:22.730Z'),
                gpgKey: 'filepartGpgKey',
                filePartByteCountThreshold: 1024,
                path: 'def.txt',
                part: [1, 1],
                local: null
            }
        ]
    };
    mf(input, (err, result) => {
        tst.deepEqual(ramda_1.dissoc('stat', result.record[0]), input.record[0]);
        // First not SHA'd as local size has changed
        tst.deepEqual(result.record[0].stat, { modifiedDate: new Date("2018-09-09T17:27:22.730Z"), fileByteCount: 200 });
        // However second has same size, but different date... suspicious... do SHA to see if file really has changed.
        tst.deepEqual(result.record[1].stat, { sha256: 'zzzSha', modifiedDate: new Date("2018-09-09T17:27:22.730Z"), fileByteCount: 200 });
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0U3RhdHNNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9nZXRUb1JlbW90ZVBlbmRpbmdDb21taXRTdGF0c01hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUI7QUFDdkIsd0NBQStIO0FBQy9ILGlDQUErQjtBQUUvQixzR0FBK0Y7QUFHL0Ysc0RBQXNEO0FBRXRELG1CQUFtQixJQUFJLEVBQUUsS0FBSztJQUMxQixNQUFNLENBQUM7UUFDSCxNQUFNLEVBQUUsTUFBTSxJQUFJO1FBQ2xCLFdBQVcsRUFBRSxNQUFNLElBQUk7UUFDdkIsYUFBYSxFQUFFLE1BQU0sS0FBSztRQUMxQixpQkFBaUIsRUFBRSxNQUFNLEtBQUs7UUFDOUIsY0FBYyxFQUFFLE1BQU0sS0FBSztRQUMzQixNQUFNLEVBQUUsTUFBTSxLQUFLO1FBQ25CLFFBQVEsRUFBRSxNQUFNLEtBQUs7UUFDckIsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNQLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDUCxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNULEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDUCxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNSLElBQUksRUFBRSxJQUFJO1FBQ1YsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNYLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDVixLQUFLLEVBQUUsSUFBSSxJQUFJLEVBQUU7UUFDakIsS0FBSyxFQUFFLEtBQUs7UUFDWixLQUFLLEVBQUUsSUFBSSxJQUFJLEVBQUU7UUFDakIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1FBQ3JCLFdBQVcsRUFBRSxDQUFDO1FBQ2QsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxDQUFDO0tB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