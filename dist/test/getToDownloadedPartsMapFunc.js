"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const ramda_1 = require("ramda");
const Client_1 = require("../src/Client");
const getToDownloadedPartsMapFunc_1 = require("../src/getToDownloadedPartsMapFunc");
const Types_1 = require("../src/Types");
const RepositoryLocalfiles_1 = require("../src/repository/RepositoryLocalfiles");
function getInput(path, part, proceed = true) {
    let d = new Date('2017-07-22T17:02:48.966Z');
    return {
        gpgKey: 'gg',
        clientId: 'notme',
        createdAt: d,
        commitId: 'b',
        record: [{
                gpgKey: 'my-gpg-key',
                filePartByteCountThreshold: 1024,
                sha256: 'sha',
                operation: Types_1.Operation.Create,
                fileByteCount: 200,
                modifiedDate: d,
                path: 'def.txt',
                part: part,
                local: null,
                stat: null,
                proceed
            }]
    };
}
function getStatResult(size) {
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
        mtime: new Date(),
        ctime: new Date(),
        birthtime: new Date()
    };
}
ava_1.default.cb("Can do everything inc. download", (tst) => {
    let statDone = 0, downloadSizeDone = 0, downloadDone = 0;
    let deps = {
        stat: (f, next) => {
            tst.is(`/store/.ebak/remote-encrypted-filepart/f-sha-${++statDone}-1KB-my--gpg--key.ebak`, f);
            next(null, getStatResult(statDone * 100));
        },
        mkdirp: (dest, next) => {
            tst.true([
                "/store/.ebak/tmp",
                "/store/.ebak/remote-encrypted-filepart"
            ].indexOf(dest) > -1);
            next(null);
        },
        download: (t, f, d, next) => {
            tst.deepEqual(t, '/store/.ebak/tmp');
            tst.deepEqual(f, ['s3://mister-bucket', 'f-sha-1-1KB-my--gpg--key.ebak']);
            tst.deepEqual(d, '/store/.ebak/remote-encrypted-filepart/f-sha-1-1KB-my--gpg--key.ebak');
            downloadDone = downloadDone + 1;
            next(null);
        },
        downloadSize: (loc, next) => {
            tst.deepEqual(loc, ['s3://mister-bucket', `f-sha-${++downloadSizeDone}-1KB-my--gpg--key.ebak`]);
            next(null, 200);
        },
        constructFilepartS3Location: RepositoryLocalfiles_1.default.constructFilepartS3Location,
        constructFilepartLocalLocation: Client_1.default.constructFilepartLocalLocation
    };
    let mapFunc = getToDownloadedPartsMapFunc_1.default(deps, '/store/.ebak', 's3://mister-bucket');
    let input = getInput('a/code.txt', [2, 2]);
    let input0 = getInput('a/code.txt', [1, 2]);
    let wasExpected = ramda_1.assoc('record', input0.record.concat(input.record), input);
    mapFunc(input, (err, result) => {
        tst.is(err, null);
        tst.is(2, statDone);
        tst.is(2, downloadSizeDone);
        tst.is(1, downloadDone);
        tst.is(null, err);
        tst.deepEqual(result, input);
        tst.end();
    });
});
ava_1.default.cb("Nothing is done when not proceed", (tst) => {
    let e = (f, next) => {
        throw new Error("Should not be here");
    };
    let deps = {
        mkdirp: e,
        stat: e,
        download: e,
        downloadSize: e,
        constructFilepartS3Location: e,
        constructFilepartLocalLocation: e
    };
    let mapFunc = getToDownloadedPartsMapFunc_1.default(deps, '/store/.ebak', 's3://mister-bucket');
    let input = getInput('a/file.txt', [1, 2], false);
    mapFunc(input, (err, result) => {
        tst.is(null, err);
        tst.deepEqual(result, input);
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9Eb3dubG9hZGVkUGFydHNNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9nZXRUb0Rvd25sb2FkZWRQYXJ0c01hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUI7QUFDdkIsaUNBQThCO0FBQzlCLDBDQUFtQztBQUduQyxvRkFBc0U7QUFFdEUsd0NBQWdPO0FBQ2hPLGlGQUEwRTtBQUUxRSxrQkFBa0IsSUFBc0IsRUFBRSxJQUFtQixFQUFFLFVBQW1CLElBQUk7SUFDbEYsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUM3QyxNQUFNLENBQUM7UUFDSCxNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFNBQVMsRUFBRSxDQUFDO1FBQ1osUUFBUSxFQUFFLEdBQUc7UUFDYixNQUFNLEVBQUUsQ0FBQztnQkFDTCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsMEJBQTBCLEVBQUUsSUFBSTtnQkFDaEMsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsU0FBUyxFQUFFLGlCQUFTLENBQUMsTUFBTTtnQkFDM0IsYUFBYSxFQUFFLEdBQUc7Z0JBQ2xCLFlBQVksRUFBRSxDQUFDO2dCQUNmLElBQUksRUFBRSxTQUFTO2dCQUNmLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxJQUFJO2dCQUNYLElBQUksRUFBRSxJQUFJO2dCQUNWLE9BQU87YUFDVixDQUFDO0tBQ0wsQ0FBQztBQUVOLENBQUM7QUFFRCx1QkFBdUIsSUFBSTtJQUN2QixNQUFNLENBQUM7UUFDSCxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNsQixXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUN2QixhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSztRQUMxQixpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO1FBQzlCLGNBQWMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO1FBQzNCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO1FBQ25CLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO1FBQ3JCLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDUCxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNSLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDVCxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNQLElBQUksRUFBRSxDQUFDLENBQUM7UUFDUixJQUFJLEVBQUUsSUFBSTtRQUNWLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDWCxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsS0FBSyxFQUFFLElBQUksSUFBSSxFQUFFO1FBQ2pCLEtBQUssRUFBRSxJQUFJLElBQUksRUFBRTtRQUNqQixLQUFLLEVBQUUsSUFBSSxJQUFJLEVBQUU7UUFDakIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO0tBQ3hCLENBQUM7QUFDTixDQUFDO0FBRUQsYUFBSSxDQUFDLEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBRS9DLElBQUksUUFBUSxHQUFHLENBQUMsRUFDWixnQkFBZ0IsR0FBRyxDQUFDLEVBQ3BCLFlBQVksR0FBRyxDQUFDLENBQUM7SUFFckIsSUFBSSxJQUFJLEdBQWlCO1FBQ3JCLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsZ0RBQWdELEVBQUUsUUFBUSx3QkFBd0IsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RixJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBQ0QsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ0wsa0JBQWtCO2dCQUNsQix3Q0FBd0M7YUFDM0MsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDZixDQUFDO1FBQ0QsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDeEIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNyQyxHQUFHLENBQUMsU0FBUyxDQUNULENBQUMsRUFDRCxDQUFDLG9CQUFvQixFQUFFLCtCQUErQixDQUFDLENBQzFELENBQUM7WUFDRixHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxzRUFBc0UsQ0FBQyxDQUFDO1lBQ3pGLFlBQVksR0FBRyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNmLENBQUM7UUFDRCxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDeEIsR0FBRyxDQUFDLFNBQVMsQ0FDVCxHQUFHLEVBQ0gsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLHdCQUF3QixDQUFDLENBQzlFLENBQUM7WUFDRixJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFDRCwyQkFBMkIsRUFBRSw4QkFBb0IsQ0FBQywyQkFBMkI7UUFDN0UsOEJBQThCLEVBQUUsZ0JBQU0sQ0FBQyw4QkFBOEI7S0FDeEUsQ0FBQztJQUVGLElBQUksT0FBTyxHQUFHLHFDQUFvQixDQUM5QixJQUFJLEVBQ0osY0FBYyxFQUNkLG9CQUFvQixDQUN2QixDQUFDO0lBRUYsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUNoQixZQUFZLEVBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ1QsQ0FBQztJQUVGLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FDakIsWUFBWSxFQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNULENBQUM7SUFFRixJQUFJLFdBQVcsR0FBRyxhQUFLLENBQ25CLFFBQVEsRUFDUixNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQ2xDLEtBQUssQ0FDUixDQUFDO0lBR0YsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUMzQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQixHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwQixHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLENBQUM7QUFJSCxhQUFJLENBQUMsRUFBRSxDQUFDLGtDQUFrQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFFaEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzFDLENBQUMsQ0FBQztJQUVGLElBQUksSUFBSSxHQUFpQjtRQUNyQixNQUFNLEVBQUUsQ0FBQztRQUNULElBQUksRUFBRSxDQUFDO1FBQ1AsUUFBUSxFQUFFLENBQUM7UUFDWCxZQUFZLEVBQUUsQ0FBQztRQUNmLDJCQUEyQixFQUFFLENBQUM7UUFDOUIsOEJBQThCLEVBQUUsQ0FBQztLQUNwQyxDQUFDO0lBRUYsSUFBSSxPQUFPLEdBQUcscUNBQW9CLENBQzlCLElBQUksRUFDSixjQUFjLEVBQ2Qsb0JBQW9CLENBQ3ZCLENBQUM7SUFFRixJQUFJLEtBQUssR0FBRyxRQUFRLENBQ2hCLFlBQVksRUFDWixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDTixLQUFLLENBQ1IsQ0FBQztJQUVGLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDM0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsQ0FBQyJ9