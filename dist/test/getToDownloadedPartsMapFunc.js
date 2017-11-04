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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9Eb3dubG9hZGVkUGFydHNNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9nZXRUb0Rvd25sb2FkZWRQYXJ0c01hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUI7QUFDdkIsaUNBQThCO0FBQzlCLDBDQUFtQztBQUduQyxvRkFBc0U7QUFFdEUsd0NBQWdPO0FBQ2hPLGlGQUEwRTtBQUUxRSxrQkFBa0IsSUFBc0IsRUFBRSxJQUFtQixFQUFFLFVBQW1CLElBQUk7SUFDbEYsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUM3QyxNQUFNLENBQUM7UUFDSCxNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFNBQVMsRUFBRSxDQUFDO1FBQ1osUUFBUSxFQUFFLEdBQUc7UUFDYixNQUFNLEVBQUUsQ0FBQztnQkFDTCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsMEJBQTBCLEVBQUUsSUFBSTtnQkFDaEMsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsU0FBUyxFQUFFLGlCQUFTLENBQUMsTUFBTTtnQkFDM0IsYUFBYSxFQUFFLEdBQUc7Z0JBQ2xCLFlBQVksRUFBRSxDQUFDO2dCQUNmLElBQUksRUFBRSxTQUFTO2dCQUNmLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxJQUFJO2dCQUNYLElBQUksRUFBRSxJQUFJO2dCQUNWLE9BQU87YUFDVixDQUFDO0tBQ0wsQ0FBQztBQUVOLENBQUM7QUFFRCx1QkFBdUIsSUFBSTtJQUN2QixNQUFNLENBQUM7UUFDSCxNQUFNLEVBQUUsTUFBTSxJQUFJO1FBQ2xCLFdBQVcsRUFBRSxNQUFNLElBQUk7UUFDdkIsYUFBYSxFQUFFLE1BQU0sS0FBSztRQUMxQixpQkFBaUIsRUFBRSxNQUFNLEtBQUs7UUFDOUIsY0FBYyxFQUFFLE1BQU0sS0FBSztRQUMzQixNQUFNLEVBQUUsTUFBTSxLQUFL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