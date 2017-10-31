"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const getRepositoryCommitToRemoteCommitMapFunc_1 = require("../src/getRepositoryCommitToRemoteCommitMapFunc");
ava_1.default.cb("Download Generate Environment (base)", (tst) => {
    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");
    let input = { path: "c-X3aeit8p000-mattfirst.commit" };
    let expected = {
        commitType: "remote-pending-commit",
        path: "c-X3aeit8p000-mattfirst.commit",
        result: {
            exitStatus: 0,
            output: [{
                    name: 'stdout',
                    text: 'dd if="/repos/ebak-commit-bucket/c-X3aeit8p000-mattfirst.commit" | gpg -d -r "ebak" | cat > "/tmp/x/.ebak/tmp/c-X3aeit8p000-mattfirst.commit"'
                }]
        }
    };
    // export interface CmdSpawner {
    // (env, cwd: string, cmd: Cmd, args: CmdArgument[], out: (s: string) => void, err: (s: string) => void, next: Callback<ExitStatus>): void;
    // }
    let dependencies = {
        cmdSpawner: (env, cwd, cmd, args, stdOutEvtHnd, stdErrEvtHnd, next) => {
            stdOutEvtHnd(`dd if="${env.OPT_S3_BUCKET}/${env.OPT_S3_OBJECT}" | gpg -d -r "${env.OPT_GPG_KEY}" | cat > "${env.OPT_DESTINATION}"`);
            next(null, 0);
        },
        rename: (src, dest, next) => {
            tst.is(src, "/tmp/x/.ebak/tmp/c-X3aeit8p000-mattfirst.commit");
            tst.is(dest, "/tmp/x/.ebak/remote-pending-commit/c-X3aeit8p000-mattfirst.commit");
            next(null);
        },
        mkdirp: (dest, next) => {
            tst.is(dest, "/tmp/x/.ebak/remote-pending-commit");
            next(null);
        }
    };
    let mapFunc = getRepositoryCommitToRemoteCommitMapFunc_1.default(dependencies, '/tmp/x/.ebak', '/repos/ebak-commit-bucket', 'ebak', 'bash/test-download-cat');
    mapFunc(input, (err, result) => {
        tst.deepEqual(result, expected);
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UmVwb3NpdG9yeUNvbW1pdFRvUmVtb3RlQ29tbWl0TWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvZ2V0UmVwb3NpdG9yeUNvbW1pdFRvUmVtb3RlQ29tbWl0TWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUN2Qiw4R0FBdUc7QUFLdkcsYUFBSSxDQUFDLEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBRXBELElBQUksWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFFeEQsSUFBSSxLQUFLLEdBQWEsRUFBRSxJQUFJLEVBQUUsZ0NBQWdDLEVBQUUsQ0FBQztJQUVqRSxJQUFJLFFBQVEsR0FBMkM7UUFDbkQsVUFBVSxFQUFFLHVCQUF1QjtRQUNuQyxJQUFJLEVBQUUsZ0NBQWdDO1FBQ3RDLE1BQU0sRUFBRTtZQUNKLFVBQVUsRUFBRSxDQUFDO1lBQ2IsTUFBTSxFQUFFLENBQUM7b0JBQ0wsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsSUFBSSxFQUFFLCtJQUErSTtpQkFDeEosQ0FBQztTQUNMO0tBQ0osQ0FBQztJQUVOLGdDQUFnQztJQUM1QiwySUFBMkk7SUFDL0ksSUFBSTtJQUVBLElBQUksWUFBWSxHQUFHO1FBQ2YsVUFBVSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDbEUsWUFBWSxDQUNSLFVBQVUsR0FBRyxDQUFDLGFBQWEsSUFBSSxHQUFHLENBQUMsYUFBYSxrQkFBa0IsR0FBRyxDQUFDLFdBQVcsY0FBYyxHQUFHLENBQUMsZUFBZSxHQUFHLENBQ3hILENBQUM7WUFDRixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFDRCxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLGlEQUFpRCxDQUFDLENBQUM7WUFDL0QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsbUVBQW1FLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDZixDQUFDO1FBQ0QsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ25CLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLG9DQUFvQyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2YsQ0FBQztLQUNKLENBQUM7SUFFRixJQUFJLE9BQU8sR0FBRyxrREFBd0MsQ0FDbEQsWUFBWSxFQUNaLGNBQWMsRUFDZCwyQkFBMkIsRUFDM0IsTUFBTSxFQUNOLHdCQUF3QixDQUMzQixDQUFDO0lBRUYsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUMzQixHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNoQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztBQUlQLENBQUMsQ0FBQyxDQUFDIn0=