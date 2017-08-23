import test from 'ava';
import { join } from 'path';
import { MkdirP, getCommitToCommittedMapFunc } from '../src/getCommitToCommittedMapFunc';
import { AtomicFileWrite } from '../src/atomicFileWrite';
import { Operation, AbsoluteDirectoryPath, AbsoluteFilePath, Committed, Commit } from '../src/Types';
import { MapFunc } from 'streamdash';

test.cb("Can map", (tst) => {

    let input: Commit = {
        record: [
            {
                sha256: "def8c",
                operation: Operation.Create,
                fileByteCount: 600,
                modifiedDate: new Date("2017-06-19T06:20:05.168Z"),
                path: "/error_command",
                part: [22, 152],
            },
            {
                sha256: "def8c",
                operation: Operation.Create,
                fileByteCount: 600,
                modifiedDate: new Date("2017-06-19T06:20:05.168Z"),
                path: "/error_command",
                part: [23, 152],
            },
            {
                sha256: "abc12",
                operation: Operation.Create,
                fileByteCount: 200,
                modifiedDate: new Date("2017-06-19T02:00:05.000Z"),
                path: "/test-file",
                part: [2, 5],
            }
        ],
        createdAt: new Date("2017-06-21:06:06.000Z"),
        commitId: "001",
        clientId: "ClientId",
    };

    let expected: Committed = Object.assign({}, input, {
        relativeFilePath: '001-ClientId.commit'
    });

    let expectedContents = [
        "def8c;1;600;22_152;2017-06-19T06:20:05.168Z;/error_command",
        "def8c;1;600;23_152;2017-06-19T06:20:05.168Z;/error_command",
        "abc12;1;200;2_5;2017-06-19T02:00:05.000Z;/test-file"
    ];

    let atomicFileWrite: (tmpPath: AbsoluteFilePath, finalPath: AbsoluteFilePath, contents: string[]) => Promise<AbsoluteFilePath> = (tmpPath, finalPath, contents) => {
        tst.is(tmpPath, '/tmp/ebak:test/.ebak/tmp/001-ClientId.commit');
        tst.is(finalPath, '/tmp/ebak:test/.ebak/commits/001-ClientId.commit');
        tst.deepEqual(contents, expectedContents);
        return Promise.resolve(finalPath);
    };

    let dirsCreated: AbsoluteDirectoryPath[] = [];
    let mkdirp: MkdirP = (p: AbsoluteDirectoryPath, next) => {
        dirsCreated.push(p);
        next(null);
    };
    let rootPath = '/tmp/ebak:test',
        tmpDir = join(rootPath, ".ebak", "tmp"),
        commitDir = join(rootPath, '.ebak', 'commits');

    let commitToCommittedMapFunc = getCommitToCommittedMapFunc(
        { mkdirp, atomicFileWrite},
        rootPath,
        tmpDir,
        commitDir
    );

    commitToCommittedMapFunc(input, (err, val) => {
        tst.deepEqual(
            dirsCreated,
            ['/tmp/ebak:test/.ebak/tmp', '/tmp/ebak:test/.ebak/commits']
        );
        tst.deepEqual(val, expected);
        tst.end();
    });
});

