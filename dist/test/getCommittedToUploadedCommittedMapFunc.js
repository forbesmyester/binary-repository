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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tbWl0dGVkVG9VcGxvYWRlZENvbW1pdHRlZE1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0L2dldENvbW1pdHRlZFRvVXBsb2FkZWRDb21taXR0ZWRNYXBGdW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQXVCO0FBQ3ZCLDBHQUFtRztBQUNuRyxnREFBNkM7QUFLN0MsYUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUVyQixJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBRXhELElBQUksS0FBSyxHQUFtQjtRQUN4QixJQUFJLEVBQUUsd0JBQXdCO1FBQzlCLFVBQVUsRUFBRSxnQkFBZ0I7S0FDL0IsQ0FBQztJQUVGLElBQUksT0FBTyxHQUFHLGdEQUFzQyxDQUNoRDtRQUNJLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsVUFBVSxFQUFFLHFCQUFTLENBQUMsYUFBYSxFQUFFO1FBQ3JDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BDLEVBQ0QsY0FBYyxFQUNkLG9CQUFvQixFQUNwQixNQUFNLEVBQ04scUJBQXFCLENBQ3hCLENBQUM7SUFFRixPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzNCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xCLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLENBQUMifQ==