import test from 'ava';
import getCommittedToUploadedCommittedMapFunc from '../src/getCommittedToUploadedCommittedMapFunc';
import { CmdRunner } from '../src/CmdRunner';
import { CommitFilename } from '../src/Types';

test.cb("do it", (tst) => {

    let input: CommitFilename = {
        path: 'zzz001-ClientId.commit',
        commitType: 'pending-commit'
    };

    let mapFunc = getCommittedToUploadedCommittedMapFunc(
        {
            mkdirp: (d, n) => { n(null); },
            cmdSpawner: CmdRunner.getCmdSpawner(),
            rename: (s, d, n) => { n(null); }
        },
        '/tmp/x/.ebak',
        'ebak-commit-bucket',
        'ebak',
        'bash/test-upload-s3'
    );

    mapFunc(input, (err, result) => {
        tst.is(err, null);
        tst.deepEqual(result, input);
        tst.end();
    });

});
