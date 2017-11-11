"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const getRepositoryCommitToRemoteCommitMapFunc_1 = require("../src/getRepositoryCommitToRemoteCommitMapFunc");
ava_1.default.cb("Download Generate Environment (base)", (tst) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UmVwb3NpdG9yeUNvbW1pdFRvUmVtb3RlQ29tbWl0TWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvZ2V0UmVwb3NpdG9yeUNvbW1pdFRvUmVtb3RlQ29tbWl0TWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUN2Qiw4R0FBdUc7QUFHdkcsYUFBSSxDQUFDLEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBRXBELElBQUksS0FBSyxHQUFhLEVBQUUsSUFBSSxFQUFFLGdDQUFnQyxFQUFFLENBQUM7SUFFakUsSUFBSSxRQUFRLEdBQTJDO1FBQ25ELFVBQVUsRUFBRSx1QkFBdUI7UUFDbkMsSUFBSSxFQUFFLGdDQUFnQztRQUN0QyxNQUFNLEVBQUU7WUFDSixVQUFVLEVBQUUsQ0FBQztZQUNiLE1BQU0sRUFBRSxDQUFDO29CQUNMLElBQUksRUFBRSxRQUFRO29CQUNkLElBQUksRUFBRSwrSUFBK0k7aUJBQ3hKLENBQUM7U0FDTDtLQUNKLENBQUM7SUFFTixnQ0FBZ0M7SUFDNUIsMklBQTJJO0lBQy9JLElBQUk7SUFFQSxJQUFJLFlBQVksR0FBRztRQUNmLFVBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ2xFLFlBQVksQ0FDUixVQUFVLEdBQUcsQ0FBQyxhQUFhLElBQUksR0FBRyxDQUFDLGFBQWEsa0JBQWtCLEdBQUcsQ0FBQyxXQUFXLGNBQWMsR0FBRyxDQUFDLGVBQWUsR0FBRyxDQUN4SCxDQUFDO1lBQ0YsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsQixDQUFDO1FBQ0QsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUN4QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxpREFBaUQsQ0FBQyxDQUFDO1lBQy9ELEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLG1FQUFtRSxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2YsQ0FBQztRQUNELE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNmLENBQUM7S0FDSixDQUFDO0lBRUYsSUFBSSxPQUFPLEdBQUcsa0RBQXdDLENBQ2xELFlBQVksRUFDWixjQUFjLEVBQ2QsMkJBQTJCLEVBQzNCLE1BQU0sRUFDTix3QkFBd0IsQ0FDM0IsQ0FBQztJQUVGLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDM0IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFJUCxDQUFDLENBQUMsQ0FBQyJ9