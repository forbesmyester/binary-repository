"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const getCommittedToUploadedCommittedMapFunc_1 = require("../src/getCommittedToUploadedCommittedMapFunc");
const CmdRunner_1 = require("../src/CmdRunner");
ava_1.default.cb("do it", (tst) => {
    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");
    let input = {
        path: 'zzz001-ClientId.commit',
        commitType: 'pending-commit'
    };
    let mapFunc = getCommittedToUploadedCommittedMapFunc_1.default({
        mkdirp: (d, n) => { n(null); },
        cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner(),
        rename: (s, d, n) => { n(null); }
    }, '/tmp/x/.ebak', 'ebak-commit-bucket', 'ebak', 'bash/test-upload-s3');
    mapFunc(input, (err, result) => {
        tst.is(err, null);
        tst.deepEqual(result, input);
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tbWl0dGVkVG9VcGxvYWRlZENvbW1pdHRlZE1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0L2dldENvbW1pdHRlZFRvVXBsb2FkZWRDb21taXR0ZWRNYXBGdW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQXVCO0FBQ3ZCLDBHQUFtRztBQUNuRyxnREFBNkM7QUFLN0MsYUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHO0lBRWpCLElBQUksWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFFeEQsSUFBSSxLQUFLLEdBQW1CO1FBQ3hCLElBQUksRUFBRSx3QkFBd0I7UUFDOUIsVUFBVSxFQUFFLGdCQUFnQjtLQUMvQixDQUFDO0lBRUYsSUFBSSxPQUFPLEdBQUcsZ0RBQXNDLENBQ2hEO1FBQ0ksTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLFVBQVUsRUFBRSxxQkFBUyxDQUFDLGFBQWEsRUFBRTtRQUNyQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BDLEVBQ0QsY0FBYyxFQUNkLG9CQUFvQixFQUNwQixNQUFNLEVBQ04scUJBQXFCLENBQ3hCLENBQUM7SUFFRixPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU07UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsQ0FBQyJ9