import test from 'ava';
import getCommittedToUploadedCommittedMapFunc from '../src/getCommittedToUploadedCommittedMapFunc';
import { CmdRunner } from '../src/CmdRunner';
import { MapFunc } from 'streamdash';
import { CommitFilename, Operation } from '../src/Types';
import { CmdOutput } from '../src/CmdRunner';

test.cb("do it", (tst) => {

    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");

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
        'bash/test-upload-commit-s3'
    );

    mapFunc(input, (err, result) => {
        tst.is(err, null);
        tst.deepEqual(result, input);
        tst.end();
    });

});
