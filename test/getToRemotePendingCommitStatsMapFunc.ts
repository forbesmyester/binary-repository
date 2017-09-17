import test from 'ava';
import { RemotePendingCommitInfo, RemotePendingCommitStat, Operation } from '../src/Types';
import { dissoc } from 'ramda';
import { Dependencies } from '../src/getToRemotePendingCommitStatsMapFunc';
import getToRemotePendingCommitStatsMapFunc from '../src/getToRemotePendingCommitStatsMapFunc';
import { Stats } from 'fs';


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
        birthtime: new Date()
    };
}

test.cb("Can map", (tst) => {

    function stat(filename: string, next: (err: null|NodeJS.ErrnoException, stats: Stats) => void) {
        tst.is(filename, '/tmp/abc.txt');
        next(null, getResult(200, new Date("2017-09-09T17:27:22.730Z")));
    }

    let mf = getToRemotePendingCommitStatsMapFunc({ stat }, '/tmp');


        let input: RemotePendingCommitInfo = {
            clientId: 'notme',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'b',
            record: [{
                sha256: '444',
                operation: Operation.Create,
                fileByteCount: 444,
                modifiedDate: new Date('2019-09-09T17:27:22.730Z'),
                path: 'abc.txt',
                part: [1, 1],
                local: null
            }]
        };

    mf(input, (err, result: RemotePendingCommitStat) => {
        tst.deepEqual(dissoc('stat', result.record[0]), input.record[0]);
        tst.deepEqual(
            result.record[0].stat,
            { modifiedDate: new Date("2017-09-09T17:27:22.730Z"), fileByteCount: 200 }
        );
        tst.end();
    });

});
