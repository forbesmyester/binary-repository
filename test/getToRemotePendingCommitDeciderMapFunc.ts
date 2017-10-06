import test from 'ava';
import { assoc, map } from 'ramda';
import { RemotePendingCommitStatDecided, Sha256, UserErrorCode, Operation, BackupCheckDatabaseValue, RemotePendingCommitStatRecordStat, RemotePendingCommitStat } from '../src/Types';
import { DeciderUserError, Dependencies } from '../src/getToRemotePendingCommitDeciderMapFunc';
import getToRemotePendingCommitDeciderMapFunc from '../src/getToRemotePendingCommitDeciderMapFunc';

function getInput(sha256: Sha256, modifiedDate: Date, local: null|BackupCheckDatabaseValue, stat: null|RemotePendingCommitStatRecordStat, part: number = 2): RemotePendingCommitStat {
    return {
        clientId: 'notme',
        createdAt: new Date('2017-07-22T17:02:48.966Z'),
        commitId: 'b',
        record: [{
            sha256: sha256,
            operation: Operation.Create,
            fileByteCount: 200,
            modifiedDate: modifiedDate,
            path: 'def.txt',
            part: [part, 2],
            local: local,
            stat: stat
        }]
    };

}

function injectProceed(proceed: boolean, rpcs: RemotePendingCommitStat): RemotePendingCommitStatDecided {
    let r = map(
        (a) => assoc('proceed', proceed, a),
        rpcs.record
    );
    return assoc('record', r, rpcs);
}

let mapFunc = getToRemotePendingCommitDeciderMapFunc({});

test.cb("If there is stat, but it is not local (commit), stop and different to repo version.", (tst) => {

    let input = getInput(
        'remoteSha',
        new Date("2017-09-09T17:27:22.730Z"),
        null,
        { sha256: 'localSha', modifiedDate: new Date("2018-09-09T17:27:22.730Z"), fileByteCount: 200 }
    );

    mapFunc(input, (err: null|DeciderUserError) => {
        tst.true(err instanceof DeciderUserError);
        tst.is(err ? err.code : -1, UserErrorCode.BLOCKED_BY_FILE);
        tst.end();
    });
});


test.cb("If the stat is modified later the stat SHA must exist", (tst) => {

    let input = getInput(
        'remoteSha',
        new Date("2017-09-09T17:27:22.730Z"),
        { modifiedDate:  new Date("2016-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" },
        { modifiedDate: new Date("2016-10-09T17:27:22.730Z"), fileByteCount: 200 }
    );

    mapFunc(input, (err: null|DeciderUserError) => {
        tst.true(err instanceof DeciderUserError);
        tst.regex((<Error>err).message, /^Missing Sha256 /);
        tst.end();
    });
});

test.cb("If the stat is less thn the local commit then... filesystem/clock untrustworth?", (tst) => {

    let input = getInput(
        'remoteSha',
        new Date("2017-09-09T17:27:22.730Z"),
        { modifiedDate:  new Date("2016-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" },
        { modifiedDate: new Date("2016-08-09T16:27:22.730Z"), fileByteCount: 200 }
    );

    mapFunc(input, (err: null|DeciderUserError) => {
        tst.true(err instanceof DeciderUserError);
        tst.regex((<Error>err).message, /^Local file modified before commit /);
        tst.end();
    });
});

test.cb("If not the last part then skip", (tst) => {

    let input2 = getInput(
        'remoteSha',
        new Date("2017-09-09T17:27:22.730Z"),
        { modifiedDate:  new Date("2016-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" },
        { modifiedDate: new Date("2016-10-09T17:27:22.730Z"), fileByteCount: 200, sha256: "edited-since"},
        2
    );

    let input1 = getInput(
        input2.record[0].sha256,
        input2.record[0].modifiedDate,
        input2.record[0].local,
        input2.record[0].stat,
        1
    );

    mapFunc(input1, (err, result) => {
        tst.is(null, err);
        tst.deepEqual(
            result,
            injectProceed(false, input1)
        );
        mapFunc(input2, (err: null|DeciderUserError) => {
            tst.true(err instanceof DeciderUserError);
            tst.is(err ? err.code : -1, UserErrorCode.BLOCKED_BY_FILE);
            tst.end();
        });
    });
});

test.cb("If stat is modified later than local and is a different file", (tst) => {

    let input = getInput(
        'remoteSha',
        new Date("2017-09-09T17:27:22.730Z"),
        { modifiedDate:  new Date("2016-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" },
        { modifiedDate: new Date("2016-10-09T17:27:22.730Z"), fileByteCount: 200, sha256: "edited-since"}
    );

    mapFunc(input, (err: null|DeciderUserError) => {
        tst.true(err instanceof DeciderUserError);
        tst.is(err ? err.code : -1, UserErrorCode.BLOCKED_BY_FILE);
        tst.end();
    });
});

test.cb("If there is no stat file, no damage can be done so copy over", (tst) => {

    let input = getInput(
        'remoteSha',
        new Date("2017-09-09T17:27:22.730Z"),
        { modifiedDate:  new Date("2018-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" },
        null
    );

    mapFunc(input, (err: null|DeciderUserError, result) => {
        tst.is(err, null);
        tst.deepEqual(
            result,
            injectProceed(true, input)
        );
        tst.end();
    });
});

test.cb("If there is stat, but it is not local (commit), though same as repo", (tst) => {

    let input = getInput(
        'remoteSha',
        new Date("2017-09-09T17:27:22.730Z"),
        null,
        { sha256: 'remoteSha', modifiedDate: new Date("2018-09-09T17:27:22.730Z"), fileByteCount: 200 }
    );

    mapFunc(input, (err: null|DeciderUserError, result) => {
        tst.is(err, null);
        tst.deepEqual(
            result,
            injectProceed(false, input)
        );
        tst.end();
    });
});

test.cb("If modifiedDate and size same in stat and local then copy only if remote newer.", (tst) => {
    let input = getInput(
        'remoteSha',
        new Date("2018-09-09T17:27:22.730Z"),
        { modifiedDate:  new Date("2017-09-09T17:27:22.730Z"), fileByteCount: 200, sha256: "sha" },
        { modifiedDate: new Date("2017-09-09T17:27:22.730Z"), fileByteCount: 200 }
    );

    mapFunc(input, (err: null|DeciderUserError, result) => {
        tst.is(err, null);
        tst.deepEqual(
            result,
            injectProceed(true, input)
        );
        tst.end();
    });
});

test.cb("Stat modified later then local, but Sha256 proove same as local then copy only if remote newer.", (tst) => {

    let input = getInput(
        'remoteSha',
        new Date("2015-09-09T17:27:22.730Z"),
        { modifiedDate:  new Date("2016-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" },
        { modifiedDate: new Date("2016-10-09T17:27:22.730Z"), fileByteCount: 200, sha256: "sha"}
    );

    mapFunc(input, (err, result) => {
        tst.is(null, err);
        tst.deepEqual(
            result,
            injectProceed(false, input)
        );
        tst.end();
    });
});
