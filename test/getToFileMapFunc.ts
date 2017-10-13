import test from 'ava';
import { assoc } from 'ramda';
import { Stats } from 'fs';
import { MapFunc } from 'streamdash';
import getToFile from '../src/getToFileMapFunc';
import { Dependencies } from '../src/getToFileMapFunc';
import { GpgKey, FilePartIndex, RelativeFilePath, Operation, Sha256, RemotePendingCommitDownloaded, AbsoluteFilePath, AbsoluteDirectoryPath, RemotePendingCommitStat, Callback, S3BucketName, S3Object, ByteCount } from '../src/Types';

function getInput(path: RelativeFilePath, part: FilePartIndex, proceed = true): RemotePendingCommitDownloaded {
    let d = new Date('2017-07-22T17:02:48.000Z');
    return {
        clientId: 'notme',
        createdAt: d,
        commitId: 'Xb',
        record: [{
            sha256: 'sha',
            operation: Operation.Create,
            fileByteCount: 200,
            modifiedDate: d,
            path: path,
            part: part,
            local: null,
            stat: null,
            proceed
        }]
    };

}

test.cb('Will skip if not proceed', (tst) => {

    let done = {
        rename: 0,
        decrypt: 0,
        mkdirp: 1,
        unlink: 0,
        utimes: 0
    };

    let e = () => { throw new Error("Should not be here"); };

    let deps = {
        utimes: e,
        unlink: e,
        decrypt: e,
        rename: (s, d, n) => {
            tst.is(s, '/store/.ebak/remote-pending-commit/Xb-notme.commit');
            tst.is(d, '/store/.ebak/remote-commit/Xb-notme.commit');
            done.rename = done.rename + 1;
            n(null);
        },
        mkdirp: (p, n) => {
            tst.is(p, '/store/.ebak/remote-commit');
            n(null);
        }
    };

    let mf = getToFile(deps, 'gpgKey', '/store/.ebak', '/store');

    mf(getInput('Docs/a.txt', [2, 2], false), (e, r) => {
        tst.is(done.utimes, 0);
        tst.is(done.decrypt, 0);
        tst.is(done.mkdirp, 1);
        tst.is(done.rename, 1);
        tst.is(done.unlink, 0);
        tst.is(null, e);
        tst.deepEqual(r, getInput('Docs/a.txt', [2, 2], false));
        tst.end();
    });

});


test.cb('Can unencrypt local FilePart', (tst) => {

    let done = {
        rename: 0,
        decrypt: 0,
        mkdirp: 0,
        unlink: 0,
        utimes: 0
    };

    let deps = {
        utimes: (f: AbsoluteFilePath, atime: number, mtime: number, next: Callback<void>) => {
            done.utimes = done.utimes + 1;
            tst.is(f, '/store/Docs/a.txt');
            tst.is(atime, 1500742968);
            tst.is(mtime, 1500742968);
            next(null);
        },
        rename: (oldFn: AbsoluteFilePath, newFn: AbsoluteFilePath, next: Callback<void>) => {
            let expected = {
                oldFn: [
                    '/store/.ebak/tmp/sha.ebak.dec',
                    '/store/.ebak/remote-pending-commit/Xb-notme.commit'
                ],
                newFn: [
                    '/store/Docs/a.txt',
                    '/store/.ebak/remote-commit/Xb-notme.commit'
                ]
            };
            tst.is(oldFn, expected.oldFn[done.rename]);
            tst.is(newFn, expected.newFn[done.rename]);
            done.rename = done.rename + 1;
            next(null);
        },
        mkdirp: (p, n) => {
            let expected = [
                '/store/Docs',
                '/store/.ebak/remote-commit'
            ];
            tst.is(p, expected[done.mkdirp]);
            done.mkdirp = done.mkdirp + 1;
            n(null);
        },
        unlink: (path: AbsoluteFilePath, next: Callback<void>) => {
            let expected = [
                '/store/.ebak/remote-encrypted-filepart/f-sha-1.ebak',
                '/store/.ebak/remote-encrypted-filepart/f-sha-2.ebak'
            ];
            tst.deepEqual(path, expected[done.unlink]);
            done.unlink = done.unlink + 1;
            next(null);
        },
        decrypt: (gpgKey: GpgKey, src: AbsoluteFilePath[], dst: AbsoluteFilePath, next: Callback<void>) => {
            tst.is(gpgKey, 'gpgKey');
            tst.is(dst, '/store/.ebak/tmp/sha.ebak.dec');
            tst.deepEqual(src, [
                '/store/.ebak/remote-encrypted-filepart/f-sha-1.ebak',
                '/store/.ebak/remote-encrypted-filepart/f-sha-2.ebak'
            ]);
            done['decrypt'] = done['decrypt'] + 1;
            next(null);
        }
    };

    let mf = getToFile(deps, 'gpgKey', '/store/.ebak', '/store');

    mf(getInput('Docs/a.txt', [2, 2]), (e, r) => {
        tst.is(done.utimes, 1);
        tst.is(done.decrypt, 1);
        tst.is(done.mkdirp, 2);
        tst.is(done.rename, 2);
        tst.is(done.unlink, 2);
        tst.is(null, e);
        tst.deepEqual(r, getInput('Docs/a.txt', [2, 2]));
        tst.end();
    });

});
