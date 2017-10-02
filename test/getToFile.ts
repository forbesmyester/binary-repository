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
            path: 'def.txt',
            part: part,
            local: null,
            stat: null,
            proceed: true
        }]
    };

}

test.cb('Can unencrypt local FilePart', (tst) => {

    let deps = {
        rename: (oldFn: AbsoluteFilePath, newFn: AbsoluteFilePath, next: Callback<void>) => {
            next(null);
        },
        mkdirp: (p, n) => {
            n(null);
        },
        unlink: (path: AbsoluteFilePath, next: Callback<void>) => {
            next(null);
        },
        decrypt: (gpgKey: GpgKey, tmpfile: AbsoluteFilePath, src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>) => {
            next(null);
        }
    };

    let mf = getToFile(deps, '/store/.ebak', '/store');

    mf(getInput('Docs/a.txt', [2, 2]), (e, r) => {
        tst.is(null, e);
        tst.deepEqual(r, getInput('Docs/a.txt', [2, 2]));
    });


});
