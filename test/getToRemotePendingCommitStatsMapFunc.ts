import test from 'ava';
import { AbsoluteFilePath, Callback, Sha256, RemotePendingCommitInfo, RemotePendingCommitStat, Operation } from '../src/Types';
import { dissoc } from 'ramda';
import getToRemotePendingCommitStatsMapFunc from '../src/getToRemotePendingCommitStatsMapFunc';
import { Stats } from 'fs';

// TODO does this check sizes if modifiedDate is same?

function getResult(size, mtime): Stats {
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

test.cb("Can map", (tst) => {

    function stat(filename: string, next: (err: null|NodeJS.ErrnoException, stats: Stats) => void) {
        let expectedFilenames = ['/tmp/abc.txt', '/tmp/def.txt'];
        tst.truthy(expectedFilenames.indexOf(filename) > -1);
        next(null, getResult(200, new Date("2018-09-09T17:27:22.730Z")));
    }

    function runner(filename: AbsoluteFilePath, next: Callback<Sha256>) {
        let expectedFilenames = ['/tmp/def.txt'];
        tst.truthy(expectedFilenames.indexOf(filename) > -1);
        next(null, 'zzzSha');
    }

    let mf = getToRemotePendingCommitStatsMapFunc({ stat, runner }, '/tmp');


        let input: RemotePendingCommitInfo = {
            clientId: 'notme',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'b',
            gpgKey: 'commitGpgKey',
            record: [
                {
                    sha256: '444',
                    operation: Operation.Create,
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
                    operation: Operation.Create,
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

    mf(input, (err, result: RemotePendingCommitStat) => {
        tst.deepEqual(dissoc('stat', result.record[0]), input.record[0]);
        // First not SHA'd as local size has changed
        tst.deepEqual(
            result.record[0].stat,
            { modifiedDate: new Date("2018-09-09T17:27:22.000Z"), fileByteCount: 200 }
        );
        // However second has same size, but different date... suspicious... do SHA to see if file really has changed.
        tst.deepEqual(
            result.record[1].stat,
            { sha256: 'zzzSha', modifiedDate: new Date("2018-09-09T17:27:22.000Z"), fileByteCount: 200 }
        );
        tst.end();
    });

});
