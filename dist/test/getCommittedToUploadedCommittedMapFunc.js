"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const getCommittedToUploadedCommittedMapFunc_1 = require("../src/getCommittedToUploadedCommittedMapFunc");
const CmdRunner_1 = require("../src/CmdRunner");
ava_1.default.cb("do it", (tst) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tbWl0dGVkVG9VcGxvYWRlZENvbW1pdHRlZE1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0L2dldENvbW1pdHRlZFRvVXBsb2FkZWRDb21taXR0ZWRNYXBGdW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQXVCO0FBQ3ZCLDBHQUFtRztBQUNuRyxnREFBNkM7QUFHN0MsYUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUVyQixJQUFJLEtBQUssR0FBbUI7UUFDeEIsSUFBSSxFQUFFLHdCQUF3QjtRQUM5QixVQUFVLEVBQUUsZ0JBQWdCO0tBQy9CLENBQUM7SUFFRixJQUFJLE9BQU8sR0FBRyxnREFBc0MsQ0FDaEQ7UUFDSSxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLFVBQVUsRUFBRSxxQkFBUyxDQUFDLGFBQWEsRUFBRTtRQUNyQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNwQyxFQUNELGNBQWMsRUFDZCxvQkFBb0IsRUFDcEIsTUFBTSxFQUNOLHFCQUFxQixDQUN4QixDQUFDO0lBRUYsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUMzQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQixHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIn0=