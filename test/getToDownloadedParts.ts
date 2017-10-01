import test from 'ava';
import { Stats } from 'fs';
import { MapFunc } from 'streamdash';
import getToDownloadedParts from '../src/getToDownloadedParts';
import { Dependencies } from '../src/getToDownloadedParts';
import { FilePartIndex, RelativeFilePath, Operation, Sha256, RemotePendingCommitDownloaded, AbsoluteFilePath, AbsoluteDirectoryPath, RemotePendingCommitStat, Callback, S3BucketName, S3Object, ByteCount } from '../src/Types';

function getInput(path: RelativeFilePath, part: FilePartIndex): RemotePendingCommitDownloaded {
    let d = new Date('2017-07-22T17:02:48.966Z');
    return {
        clientId: 'notme',
        createdAt: d,
        commitId: 'b',
        record: [{
            sha256: 'sha',
            operation: Operation.Create,
            fileByteCount: 200,
            modifiedDate: d,
            path: 'def.txt',
            part: part,
            local: null,
            stat: null,
            proceed: true
        }]
    };

}

function getStatResult(size): Stats {
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

test.cb("Can do everything inc. download", (tst) => {

    let statDone = 0,
        downloadSizeDone = 0,
        downloadDone = false;

    let deps: Dependencies = {
        stat: (f, next) => {
            tst.is(`/store/.ebak/f-sha-${++statDone}.ebak`, f);
            next(null, getStatResult(statDone * 100));
        },
        download: (f, next) => {
            tst.deepEqual(
                f,
                ['s3://mister-bucket', 'f-sha-1.ebak']
            );
            downloadDone = true;
            next(null);
        },
        downloadSize: (loc, next) => {
            tst.deepEqual(
                loc,
                ['s3://mister-bucket', `f-sha-${++downloadSizeDone}.ebak`]
            );
            next(null, 200);
        }
    };

    let mapFunc = getToDownloadedParts(
        deps,
        '/store/.ebak',
        's3://mister-bucket'
    );

    let input = getInput(
        'a/code.txt',
        [2, 2]
    );

    mapFunc(input, (err, result) => {
        tst.is(2, statDone);
        tst.is(2, downloadSizeDone);
        tst.is(null, err);
        tst.deepEqual(result, input);
        tst.end();
    });

});


test.cb("Nothing is done when not last", (tst) => {

    let statDone = false,
        downloadSizeDone = false;

    let deps: Dependencies = {
        stat: (f, next) => {
            statDone = true;
            next(null, getStatResult(200));
        },
        download: (f, next) => {
            throw new Error("Should not be here");
        },
        downloadSize: (loc, next) => {
            downloadSizeDone = true;
            next(null, 200);
        }
    };

    let mapFunc = getToDownloadedParts(
        deps,
        '/store/.ebak',
        's3://mister-bucket'
    );

    let input = getInput(
        'a/file.txt',
        [1, 1]
    );

    mapFunc(input, (err, result) => {
        tst.is(true, statDone);
        tst.is(true, downloadSizeDone);
        tst.is(null, err);
        tst.deepEqual(result, input);
        tst.end();
    });

});

test.cb("Nothing is done when not last", (tst) => {

    let e = (f, next) => {
        throw new Error("Should not be here");
    };

    let deps: Dependencies = {
        stat: e,
        download: e,
        downloadSize: e
    };

    let mapFunc = getToDownloadedParts(
        deps,
        '/store/.ebak',
        's3://mister-bucket'
    );

    let input = getInput(
        'a/file.txt',
        [1, 2]
    );

    mapFunc(input, (err, result) => {
        tst.is(null, err);
        tst.deepEqual(result, input);
        tst.end();
    });

});
