import test from 'ava';
import Client from '../src/Client';
import { Stats } from 'fs';
import getToDownloadedParts from '../src/getToDownloadedPartsMapFunc';
import { Dependencies } from '../src/getToDownloadedPartsMapFunc';
import { FilePartIndex, RelativeFilePath, Operation, RemotePendingCommitDownloaded } from '../src/Types';
import RepositoryLocalfiles from '../src/repository/RepositoryLocalfiles';

function getInput(path: RelativeFilePath, part: FilePartIndex, proceed: boolean = true): RemotePendingCommitDownloaded {
    let d = new Date('2017-07-22T17:02:48.966Z');
    return {
        gpgKey: 'gg',
        clientId: 'notme',
        createdAt: d,
        commitId: 'cid',
        record: [
            {
                gpgKey: 'my-gpg-key', // This whole object will be skipped.
                filePartByteCountThreshold: 1024,
                sha256: 'ZZZZZZZZZZZZZ',
                operation: Operation.Delete,
                fileByteCount: 200,
                modifiedDate: d,
                path: 'def.txt',
                part: part,
                local: null,
                stat: null,
                proceed
            },
            {
                gpgKey: 'my-gpg-key',
                filePartByteCountThreshold: 1024,
                sha256: 'sha',
                operation: Operation.Create,
                fileByteCount: 200,
                modifiedDate: d,
                path: 'def.txt',
                part: part,
                local: null,
                stat: null,
                proceed
            }
        ]
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

test.cb("Can do everything inc. download", (tst) => {

    let statDone = 0,
        downloadSizeDone = 0,
        downloadDone = 0;

    let deps: Dependencies = {
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
            tst.deepEqual(
                f,
                ['s3://mister-bucket', 'f-sha-1-1KB-my--gpg--key.ebak']
            );
            tst.deepEqual(d, '/store/.ebak/remote-encrypted-filepart/c-cid-f-sha-1-1KB-my--gpg--key.ebak');
            downloadDone = downloadDone + 1;
            next(null);
        },
        downloadSize: (loc, next) => {
            tst.deepEqual(
                loc,
                ['s3://mister-bucket', `f-sha-${++downloadSizeDone}-1KB-my--gpg--key.ebak`]
            );
            next(null, 200);
        },
        constructFilepartS3Location: RepositoryLocalfiles.constructFilepartS3Location,
        constructFilepartLocalLocation: Client.constructFilepartLocalLocation
    };

    let mapFunc = getToDownloadedParts(
        deps,
        '/store/.ebak',
        's3://mister-bucket',
    );

    let input = getInput(
        'a/code.txt',
        [2, 2]
    );

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



test.cb("Nothing is done when not proceed", (tst) => {

    let e = (f, next) => {
        throw new Error("Should not be here");
    };

    let deps: Dependencies = {
        mkdirp: e,
        stat: e,
        download: e,
        downloadSize: e,
        constructFilepartS3Location: e,
        constructFilepartLocalLocation: e
    };

    let mapFunc = getToDownloadedParts(
        deps,
        '/store/.ebak',
        's3://mister-bucket',
    );

    let input = getInput(
        'a/file.txt',
        [1, 2],
        false
    );

    mapFunc(input, (err, result) => {
        tst.is(null, err);
        tst.deepEqual(result, input);
        tst.end();
    });

});
