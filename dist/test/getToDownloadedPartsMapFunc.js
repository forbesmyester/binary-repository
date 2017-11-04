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
        birthtimeMs: 0,
        atime: new Date(),
        atimeMs: 0,
        mtime: new Date(),
        mtimeMs: 0,
        ctime: new Date(),
        ctimeMs: 0,
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