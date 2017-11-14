import test from 'ava';
import getCommittedToUploadedCommittedMapFunc from '../src/getCommittedToUploadedCommittedMapFunc';
import { CommitFilename } from '../src/Types';

test.cb("do it", (tst) => {

    let input: CommitFilename = {
        path: 'zzz001-ClientId.commit',
        commitType: 'pending-commit'
    };

    let done = {
        rename: false,
        upload: false,
        cmdSpawner: false,
        mkdirp: false,
        unlink: false
    };

    let mapFunc = getCommittedToUploadedCommittedMapFunc(
        {
            unlink: (f, n) => {
                done.unlink = true;
                n(null);
            },
            mkdirp: (d, n) => {
                done.mkdirp = true;
                n(null);
            },
            cmdSpawner: (env, cwd, cmd, args, out, err, next) => {
                done.cmdSpawner = true;
                tst.is(
                    env.OPT_SRC,
                    '/home/you/store/.binary-repository/pending-commit/zzz001-ClientId.commit'
                );
                tst.is(
                    '/home/you/store/.binary-repository/tmp/zzz001-ClientId.commit.enc',
                    env.OPT_DST,
                );
                next(null, 0);
            },
            rename: (s, d, n) => {
                done.rename = true;
                n(null);
            },
            upload: (tmpDir, src , loc, next) => {
                done.upload = true;
                next(null);
            }
        },
        '/home/you/store/.binary-repository',
        'ebak-commit-bucket',
        'ebak',
        'bash/test-upload-s3'
    );

    mapFunc(input, (err, result) => {
        tst.is(err, null);
        tst.deepEqual(
            done,
            { rename: true, upload: true, cmdSpawner: true, mkdirp: true, unlink: true }
        );
        tst.deepEqual(result, Object.assign({}, input, { gpgKey: 'ebak' }));
        tst.end();
    });

});
