"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const ramda_1 = require("ramda");
const Types_1 = require("../src/Types");
const getToRemotePendingCommitDeciderMapFunc_1 = require("../src/getToRemotePendingCommitDeciderMapFunc");
const getToRemotePendingCommitDeciderMapFunc_2 = require("../src/getToRemotePendingCommitDeciderMapFunc");
function getInput(sha256, modifiedDate, local, stat, part = 2) {
    return {
        gpgKey: 'gg',
        clientId: 'notme',
        createdAt: new Date('2017-07-22T17:02:48.966Z'),
        commitId: 'b',
        record: [{
                filePartByteCountThreshold: 1024,
                gpgKey: 'g',
                sha256: sha256,
                operation: Types_1.Operation.Create,
                fileByteCount: 200,
                modifiedDate: modifiedDate,
                path: 'def.txt',
                part: [part, 2],
                local: local,
                stat: stat
            }]
    };
}
function injectProceed(proceed, rpcs) {
    let r = ramda_1.map((a) => ramda_1.assoc('proceed', proceed, a), rpcs.record);
    return ramda_1.assoc('record', r, rpcs);
}
let mapFunc = getToRemotePendingCommitDeciderMapFunc_2.default({});
ava_1.default.cb("If there is stat, but it is not local (commit), stop and different to repo version.", (tst) => {
    let input = getInput('remoteSha', new Date("2017-09-09T17:27:22.730Z"), null, { sha256: 'localSha', modifiedDate: new Date("2018-09-09T17:27:22.730Z"), fileByteCount: 200 });
    mapFunc(input, (err) => {
        tst.true(err instanceof getToRemotePendingCommitDeciderMapFunc_1.DeciderUserError);
        tst.is(err ? err.code : -1, Types_1.UserErrorCode.BLOCKED_BY_FILE);
        tst.end();
    });
});
ava_1.default.cb("If the stat is modified later the stat SHA must exist", (tst) => {
    let input = getInput('remoteSha', new Date("2017-09-09T17:27:22.730Z"), { modifiedDate: new Date("2016-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" }, { modifiedDate: new Date("2016-10-09T17:27:22.730Z"), fileByteCount: 200 });
    mapFunc(input, (err) => {
        tst.true(err instanceof getToRemotePendingCommitDeciderMapFunc_1.DeciderUserError);
        tst.regex(err.message, /^Missing Sha256 /);
        tst.end();
    });
});
ava_1.default.cb("If the stat is less thn the local commit then... filesystem/clock untrustworth?", (tst) => {
    let input = getInput('remoteSha', new Date("2017-09-09T17:27:22.730Z"), { modifiedDate: new Date("2016-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" }, { modifiedDate: new Date("2016-08-09T16:27:22.730Z"), fileByteCount: 200 });
    mapFunc(input, (err) => {
        tst.true(err instanceof getToRemotePendingCommitDeciderMapFunc_1.DeciderUserError);
        tst.regex(err.message, /^Local file modified before commit /);
        tst.end();
    });
});
ava_1.default.cb("If not the last part then skip", (tst) => {
    let input2 = getInput('remoteSha', new Date("2017-09-09T17:27:22.730Z"), { modifiedDate: new Date("2016-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" }, { modifiedDate: new Date("2016-10-09T17:27:22.730Z"), fileByteCount: 200, sha256: "edited-since" }, 2);
    let input1 = getInput(input2.record[0].sha256, input2.record[0].modifiedDate, input2.record[0].local, input2.record[0].stat, 1);
    mapFunc(input1, (err, result) => {
        tst.is(null, err);
        tst.deepEqual(result, injectProceed(false, input1));
        mapFunc(input2, (err) => {
            tst.true(err instanceof getToRemotePendingCommitDeciderMapFunc_1.DeciderUserError);
            tst.is(err ? err.code : -1, Types_1.UserErrorCode.BLOCKED_BY_FILE);
            tst.end();
        });
    });
});
ava_1.default.cb("If stat is modified later than local and is a different file", (tst) => {
    let input = getInput('remoteSha', new Date("2017-09-09T17:27:22.730Z"), { modifiedDate: new Date("2016-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" }, { modifiedDate: new Date("2016-10-09T17:27:22.730Z"), fileByteCount: 200, sha256: "edited-since" });
    mapFunc(input, (err) => {
        tst.true(err instanceof getToRemotePendingCommitDeciderMapFunc_1.DeciderUserError);
        tst.is(err ? err.code : -1, Types_1.UserErrorCode.BLOCKED_BY_FILE);
        tst.end();
    });
});
ava_1.default.cb("If there is no stat file, no damage can be done so copy over", (tst) => {
    let input = getInput('remoteSha', new Date("2017-09-09T17:27:22.730Z"), { modifiedDate: new Date("2018-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" }, null);
    mapFunc(input, (err, result) => {
        tst.is(err, null);
        tst.deepEqual(result, injectProceed(true, input));
        tst.end();
    });
});
ava_1.default.cb("If there is stat, but it is not local (commit), though same as repo", (tst) => {
    let input = getInput('remoteSha', new Date("2017-09-09T17:27:22.730Z"), null, { sha256: 'remoteSha', modifiedDate: new Date("2018-09-09T17:27:22.730Z"), fileByteCount: 200 });
    mapFunc(input, (err, result) => {
        tst.is(err, null);
        tst.deepEqual(result, injectProceed(false, input));
        tst.end();
    });
});
ava_1.default.cb("If modifiedDate and size same in stat and local then copy only if remote newer.", (tst) => {
    let input = getInput('remoteSha', new Date("2018-09-09T17:27:22.730Z"), { modifiedDate: new Date("2017-09-09T17:27:22.730Z"), fileByteCount: 200, sha256: "sha" }, { modifiedDate: new Date("2017-09-09T17:27:22.730Z"), fileByteCount: 200 });
    mapFunc(input, (err, result) => {
        tst.is(err, null);
        tst.deepEqual(result, injectProceed(true, input));
        tst.end();
    });
});
ava_1.default.cb("Stat modified later then local, but Sha256 proove same as local then copy only if remote newer.", (tst) => {
    let input = getInput('remoteSha', new Date("2015-09-09T17:27:22.730Z"), { modifiedDate: new Date("2016-09-09T17:27:22.730Z"), fileByteCount: 3832, sha256: "sha" }, { modifiedDate: new Date("2016-10-09T17:27:22.730Z"), fileByteCount: 200, sha256: "sha" });
    mapFunc(input, (err, result) => {
        tst.is(null, err);
        tst.deepEqual(result, injectProceed(false, input));
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0RGVjaWRlck1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0L2dldFRvUmVtb3RlUGVuZGluZ0NvbW1pdERlY2lkZXJNYXBGdW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQXVCO0FBQ3ZCLGlDQUFtQztBQUNuQyx3Q0FBc0w7QUFDdEwsMEdBQWlGO0FBQ2pGLDBHQUFtRztBQUVuRyxrQkFBa0IsTUFBYyxFQUFFLFlBQWtCLEVBQUUsS0FBb0MsRUFBRSxJQUE0QyxFQUFFLE9BQWUsQ0FBQztJQUN0SixNQUFNLENBQUM7UUFDSCxNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFNBQVMsRUFBRSxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztRQUMvQyxRQUFRLEVBQUUsR0FBRztRQUNiLE1BQU0sRUFBRSxDQUFDO2dCQUNMLDBCQUEwQixFQUFFLElBQUk7Z0JBQ2hDLE1BQU0sRUFBRSxHQUFHO2dCQUNYLE1BQU0sRUFBRSxNQUFNO2dCQUNkLFNBQVMsRUFBRSxpQkFBUyxDQUFDLE1BQU07Z0JBQzNCLGFBQWEsRUFBRSxHQUFHO2dCQUNsQixZQUFZLEVBQUUsWUFBWTtnQkFDMUIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDZixLQUFLLEVBQUUsS0FBSztnQkFDWixJQUFJLEVBQUUsSUFBSTthQUNiLENBQUM7S0FDTCxDQUFDO0FBRU4sQ0FBQztBQUVELHVCQUF1QixPQUFnQixFQUFFLElBQTZCO0lBQ2xFLElBQUksQ0FBQyxHQUFHLFdBQUcsQ0FDUCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsYUFBSyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQ25DLElBQUksQ0FBQyxNQUFNLENBQ2QsQ0FBQztJQUNGLE1BQU0sQ0FBQyxhQUFLLENBQUMs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