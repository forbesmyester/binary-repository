import test from 'ava';
import { Operation, BackupRecord, Commit } from '../src/Types';
import getLocalCommitFilenameToCommitMapFunc from '../src/getLocalCommitFilenameToCommitMapFunc';
import { pipe, path, map, assoc } from 'ramda';

test.cb("Can map", (tst) => {

    let data = [
        '["ef2",1,58,"1_1",1024,"2017-06-24T10:46:12.432Z","error_command","g"]',
        '["8cf",1,29,"2_3",1024,"2017-06-25T14:47:13.856Z","hello_command","g"]',
        '["def",1,1816,"1_1",1024,"2017-06-19T06:20:05.168Z","my-projects/getTLIdEncoderDecoder.md","g"]'
    ].join("\n");

    let commitDir = '/home/fozz/Projects/ebak/test',
        input = { commitType: 'data', path: '/c-rusdc000-gpg--key-fozz--client.commit' },
        readFile = (filename, opts, cb) => {
            tst.is(filename, '/home/fozz/Projects/ebak/test/data/c-rusdc000-gpg--key-fozz--client.commit');
            tst.deepEqual(opts, { encoding: 'utf8' });
            cb(null, data);
        },
        localCommitFileToCommitMapFunc = getLocalCommitFilenameToCommitMapFunc(
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
                { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'ef2', operation: Operation.Create, fileByteCount: 58, modifiedDate: new Date('2017-06-24T10:46:12.000Z'), path: 'error_command', part: [1, 1] },
                { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '8cf', operation: Operation.Create, fileByteCount: 29, modifiedDate: new Date('2017-06-25T14:47:13.000Z'), path: 'hello_command', part: [2, 3] },
                { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'def', operation: Operation.Create, fileByteCount: 1816, modifiedDate: new Date('2017-06-19T06:20:05.000Z'), path: 'my-projects/getTLIdEncoderDecoder.md', part: [1, 1] }
            ],
            expected: Commit = {
                gpgKey: 'gpg-key',
                clientId: 'fozz-client',
                createdAt: new Date('2017-07-22T17:02:48.966Z'),
                commitId: 'rusdc000',
                record: backupRecords
            };

        tst.deepEqual(serialize(c), serialize(expected));
        tst.end();
    });
});
