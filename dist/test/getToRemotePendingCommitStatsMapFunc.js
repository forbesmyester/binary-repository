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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0U3RhdHNNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9nZXRUb1JlbW90ZVBlbmRpbmdDb21taXRTdGF0c01hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUI7QUFDdkIsd0NBQStIO0FBQy9ILGlDQUErQjtBQUMvQixzR0FBK0Y7QUFHL0Ysc0RBQXNEO0FBRXRELG1CQUFtQixJQUFJLEVBQUUsS0FBSztJQUMxQixNQUFNLENBQUM7UUFDSCxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNsQixXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUN2QixhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSztRQUMxQixpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO1FBQzlCLGNBQWMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO1FBQzNCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO1FBQ25CLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO1FBQ3JCLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDUCxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNSLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDVCxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNQLElBQUksRUFBRSxDQUFDLENBQUM7UUFDUixJQUFJLEVBQUUsSUFBSTtRQUNWLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDWCxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsS0FBSyxFQUFFLElBQUksSUFBSSxFQUFFO1FBQ2pCLEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxFQUFFLElBQUksSUFBSSxFQUFFO1FBQ2pCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtRQUNyQixXQUFXLEVB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