import test from 'ava';
import getRepositoryCommitToRemoteCommitMapFunc from '../src/getRepositoryCommitToRemoteCommitMapFunc';
import { AbsoluteDirectoryPath, AbsoluteFilePath, S3Location, Callback, Filename, CommitFilename, CmdResult } from '../src/Types';

test.cb("Download Generate Environment (base)", (tst) => {

    let input: Filename = { path: "c-X3aeit8p000-mattfirst.commit" };

    let expected: CommitFilename & { result: CmdResult } = {
        commitType: "remote-pending-commit",
        path: "c-X3aeit8p000-mattfirst.commit",
        result: {
            exitStatus: 0,
            output: [{
                name: 'stdout',
                text: 'Some Command'
            }]
        }
    };

    let done = {
        download: false,
        spawned: false,
        rename: false,
        mkdirp: false
    };

// export interface CmdSpawner {
    // (env, cwd: string, cmd: Cmd, args: CmdArgument[], out: (s: string) => void, err: (s: string) => void, next: Callback<ExitStatus>): void;
// }

    let mkdirPass = 0;

    let dependencies = {
        download: (tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>) => {
            done.download = true;
            tst.is(tmpDir, "/tmp/x/.ebak/tmp");
            tst.is(downloadTo, "/tmp/x/.ebak/tmp/c-X3aeit8p000-mattfirst.commit.enc");
            tst.deepEqual(loc, ['/repos/ebak-commit-bucket', "c-X3aeit8p000-mattfirst.commit"]);
            next(null);
        },
        cmdSpawner: (env, cwd, cmd, args, stdOutEvtHnd, stdErrEvtHnd, next) => {
            tst.regex(cmd, /bash\/decrypt/);
            tst.is(env.OPT_IS_FIRST, "1");
            tst.is(env.OPT_SRC, "/tmp/x/.ebak/tmp/c-X3aeit8p000-mattfirst.commit.enc");
            tst.is(env.OPT_DST, "/tmp/x/.ebak/tmp/c-X3aeit8p000-mattfirst.commit");
            tst.is(env.OPT_GPG_KEY, "ebak");
            done.spawned = true;
            stdOutEvtHnd(`Some Command`);
            next(null, 0);
        },
        rename: (src, dest, next) => {
            done.rename = true;
            tst.is(src, "/tmp/x/.ebak/tmp/c-X3aeit8p000-mattfirst.commit");
            tst.is(dest, "/tmp/x/.ebak/remote-pending-commit/c-X3aeit8p000-mattfirst.commit");
            next(null);
        },
        mkdirp: (dest, next) => {
            let expected = [
                "/tmp/x/.ebak/tmp",
                "/tmp/x/.ebak/remote-pending-commit"
            ];
            done.mkdirp = true;
            tst.is(dest, expected[mkdirPass++]);
            next(null);
        }
    };

    let mapFunc = getRepositoryCommitToRemoteCommitMapFunc(
        dependencies,
        '/tmp/x/.ebak',
        '/repos/ebak-commit-bucket',
        'ebak'
    );

    mapFunc(input, (err, result) => {
        tst.deepEqual(done, {
            download: true,
            spawned: true,
            rename: true,
            mkdirp: true
        });
        tst.deepEqual(result, expected);
        tst.end();
    });



});
