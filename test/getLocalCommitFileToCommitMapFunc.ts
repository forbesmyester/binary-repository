import test from 'ava';
import { MapFunc } from 'streamdash';
import { Operation, Filename, BackupRecord, Commit } from '../src/Types';
import getLocalCommitFileToCommitMapFunc from '../src/getLocalCommitFileToCommitMapFunc';
import { pipe, path, lensPath, map, assoc } from 'ramda';

test.cb("Can map", (tst) => {

    let data = [
        'ef2;1;58;1_1;2017-06-24T10:46:12.432Z;error_command',
        '8cf;1;29;2_3;2017-06-25T14:47:13.856Z;hello_command',
        'def;1;1816;1_1;2017-06-19T06:20:05.168Z;my-projects/getTLIdEncoderDecoder.md'
    ].join("\n");

    let commitDir = '/home/fozz/Projects/ebak/test/data',
        input = { path: '/rusdc000-fozz.commit' },
        readFile = (filename, opts, cb) => {
            tst.is(filename, '/home/fozz/Projects/ebak/test/data/rusdc000-fozz.commit');
            tst.deepEqual(opts, { encoding: 'utf8' });
            cb(null, data);
        },
        localCommitFileToCommitMapFunc = getLocalCommitFileToCommitMapFunc(
            { readFile },
            commitDir,
        );

    function serialize(commit: Commit) {

        let recordMapper = (record) => {
            return assoc(
                'modifiedDate',
                (<Date>path(['modifiedDate'], record)).toISOString(),
                record
            );
        };

        let p = pipe(
            assoc('createdAt', (<Date>path(['createdAt'], commit)).toISOString()),
            (c) => {
                return assoc(
                    'record',
                    map(recordMapper, path(['record'], c)),
                    c
                );
            }
        );

        return p(commit);
    }

    localCommitFileToCommitMapFunc(input, (err, c: Commit) => {
        let backupRecords: BackupRecord[] = [
                { sha256: 'ef2', operation: Operation.Create, fileByteCount: 58, modifiedDate: new Date('2017-06-24T10:46:12.432Z'), path: 'error_command', part: [1, 1] },
                { sha256: '8cf', operation: Operation.Create, fileByteCount: 29, modifiedDate: new Date('2017-06-25T14:47:13.856Z'), path: 'hello_command', part: [2, 3] },
                { sha256: 'def', operation: Operation.Create, fileByteCount: 1816, modifiedDate: new Date('2017-06-19T06:20:05.168Z'), path: 'my-projects/getTLIdEncoderDecoder.md', part: [1, 1] }
            ],
            expected: Commit = {
                clientId: 'fozz',
                createdAt: new Date('2017-07-22T17:02:48.966Z'),
                commitId: 'rusdc000',
                record: backupRecords
            };

        tst.deepEqual(serialize(c), serialize(expected));
        tst.end();
    });
});
