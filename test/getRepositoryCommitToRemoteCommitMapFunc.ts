import test from 'ava';
import getRepositoryCommitToRemoteCommitMapFunc from '../src/getRepositoryCommitToRemoteCommitMapFunc';
import { MapFunc } from 'streamdash';
import { Filename, CommitFilename, CmdResult, Committed, UploadedCommitted, Operation } from '../src/Types';
import { CmdOutput } from '../src/CmdRunner';

test.cb("Download Generate Environment (base)", (tst) => {

    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");

    let input: Filename = { path: "c-X3aeit8p000-mattfirst.commit" };

    let expected: CommitFilename & { result: CmdResult } = {
        commitType: "remote-pending-commit",
        path: "X3aeit8p000-mattfirst.commit",
        result: {
            exitStatus: 0,
            output: [{
                name: 'stdout',
                text: 'dd if="/repos/ebak-commit-bucket/c-X3aeit8p000-mattfirst.commit" | gpg -d -r "ebak" | cat > "/tmp/x/.ebak/tmp/X3aeit8p000-mattfirst.commit"'
            }]
        }
    };

// export interface CmdSpawner {
    // (env, cwd: string, cmd: Cmd, args: CmdArgument[], out: (s: string) => void, err: (s: string) => void, next: Callback<ExitStatus>): void;
// }

    let dependencies = {
        cmdSpawner: (env, cwd, cmd, args, stdOutEvtHnd, stdErrEvtHnd, next) => {
            stdOutEvtHnd(
                `dd if="${env.OPT_S3_BUCKET}/${env.OPT_S3_OBJECT}" | gpg -d -r "${env.OPT_GPG_KEY}" | cat > "${env.OPT_DESTINATION}"`
            );
            next(null, 0);
        },
        rename: (src, dest, next) => {
            tst.is(src, "/tmp/x/.ebak/tmp/X3aeit8p000-mattfirst.commit");
            tst.is(dest, "/tmp/x/.ebak/remote-pending-commit/X3aeit8p000-mattfirst.commit");
            next(null);
        },
        mkdirp: (dest, next) => {
            tst.is(dest, "/tmp/x/.ebak/remote-pending-commit");
            next(null);
        }
    };

    let mapFunc = getRepositoryCommitToRemoteCommitMapFunc(
        dependencies,
        '/tmp/x/.ebak',
        '/repos/ebak-commit-bucket',
        'ebak',
        'bash/test-download-cat'
    );

    mapFunc(input, (err, result) => {
        tst.deepEqual(result, expected);
        tst.end();
    });



});
