import test from 'ava';
import { basename, dirname } from 'path';
import { MkdirP, getCommitToCommittedMapFunc } from '../src/getCommitToCommittedMapFunc';
import { Operation, AbsoluteDirectoryPath, AbsoluteFilePath, Committed, Commit } from '../src/Types';

test.cb("Can map", (tst) => {

    let input: Commit = {
        record: [
            {
                gpgKey: 'g',
                filePartByteCountThreshold: 1024,
                sha256: "def8c",
                operation: Operation.Create,
                fileByteCount: 600,
                modifiedDate: new Date("2017-06-19T06:20:05.168Z"),
                path: "/error_command",
                part: [22, 152],
            },
            {
                gpgKey: 'g',
                filePartByteCountThreshold: 1024,
                sha256: "def8c",
                operation: Operation.Create,
                fileByteCount: 600,
                modifiedDate: new Date("2017-06-19T06:20:05.168Z"),
                path: "/error_command",
                part: [23, 152],
            },
            {
                gpgKey: 'g',
                filePartByteCountThreshold: 1024,
                sha256: "abc12",
                operation: Operation.Create,
                fileByteCount: 200,
                modifiedDate: new Date("2017-06-19T02:00:05.000Z"),
                path: "/test-file",
                part: [2, 5],
            }
        ],
        gpgKey: 'gg',
        createdAt: new Date("2017-06-21:06:06.000Z"),
        commitId: "001",
        clientId: "client-id",
    };

    let expected: Committed = Object.assign({}, input, {
        relativeFilePath: 'c-001-gg-client--id.commit'
    });

    let expectedContents = [
        '["def8c",1,600,"22_152",1024,"2017-06-19T06:20:05.168Z","/error_command","g"]',
        '["def8c",1,600,"23_152",1024,"2017-06-19T06:20:05.168Z","/error_command","g"]',
        '["abc12",1,200,"2_5",1024,"2017-06-19T02:00:05.000Z","/test-file","g"]'
    ];

    let atomicFileWrite: (tmpPath: AbsoluteFilePath, finalPath: AbsoluteFilePath, contents: string[]) => Promise<AbsoluteFilePath> = (tmpPath, finalPath, contents) => {
        tst.is(dirname(tmpPath), '/tmp/ebak:test/tmp');
        tst.true(basename(tmpPath).length > 0);
        tst.is(finalPath, '/tmp/ebak:test/pending-commit/c-001-gg-client--id.commit');
        tst.deepEqual(contents, expectedContents);
        return Promise.resolve(finalPath);
    };

    let dirsCreated: AbsoluteDirectoryPath[] = [];
    let mkdirp: MkdirP = (p: AbsoluteDirectoryPath, next) => {
        dirsCreated.push(p);
        next(null);
    };
    let configDir = '/tmp/ebak:test';

    let commitToCommittedMapFunc = getCommitToCommittedMapFunc(
        { mkdirp, atomicFileWrite},
        configDir
    );

    commitToCommittedMapFunc(input, (err, val) => {
        tst.deepEqual(
            dirsCreated,
            ['/tmp/ebak:test/tmp', '/tmp/ebak:test/pending-commit']
        );
        tst.deepEqual(val, expected);
        tst.end();
    });
});

