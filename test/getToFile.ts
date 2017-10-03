import test from 'ava';
import { assoc } from 'ramda';
import { Stats } from 'fs';
import { MapFunc } from 'streamdash';
import getToFile from '../src/getToFile';
import { Dependencies } from '../src/getToFile';
import { GpgKey, FilePartIndex, RelativeFilePath, Operation, Sha256, RemotePendingCommitDownloaded, AbsoluteFilePath, AbsoluteDirectoryPath, RemotePendingCommitStat, Callback, S3BucketName, S3Object, ByteCount } from '../src/Types';

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
            path: path,
            part: part,
            local: null,
            stat: null,
            proceed: true
        }]
    };

}

test.cb('Can unencrypt local FilePart', (tst) => {

    let done = {
        rename: 0,
        decrypt: 0,
        mkdirp: 0,
        unlink: 0,
        joinFiles: 0
    };

    let deps = {
        rename: (oldFn: AbsoluteFilePath, newFn: AbsoluteFilePath, next: Callback<void>) => {
            next(null);
        },
        mkdirp: (p, n) => {
            tst.is(p, '/store/Docs');
            done.mkdirp = done.mkdirp + 1;
            n(null);
        },
        joinFiles: (srcs: AbsoluteFilePath[], dst: AbsoluteFilePath, next: Callback<void>) => {
            tst.deepEqual(srcs, [
                '/store/.ebak/tmp/sha-2.ebak.dec'
            ]);
            tst.is(dst, '/store/.ebak/tmp/sha.ebak.dec');
            done.joinFiles = done.joinFiles + 1;
            next(null);
        },
        unlink: (path: AbsoluteFilePath, next: Callback<void>) => {
            next(null);
        },
        decrypt: (gpgKey: GpgKey, src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>) => {
            tst.is(gpgKey, 'gpgKey');
            tst.is(dst, '/store/.ebak/tmp/sha-2.ebak.dec');
            tst.is(src, '/store/.ebak/remote-encrypted-filepart/sha-2.ebak');
            done['decrypt'] = done['decrypt'] + 1;
            next(null);
        }
    };

    let mf = getToFile(deps, 'gpgKey', '/store/.ebak', '/store');

    mf(getInput('Docs/a.txt', [2, 2]), (e, r) => {
        tst.is(done.decrypt, 1);
        tst.is(done.joinFiles, 1);
        tst.is(done.mkdirp, 1);
        tst.is(null, e);
        tst.deepEqual(r, getInput('Docs/a.txt', [2, 2]));
        tst.end();
    });

});
