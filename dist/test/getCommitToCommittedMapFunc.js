"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const path_1 = require("path");
const getCommitToCommittedMapFunc_1 = require("../src/getCommitToCommittedMapFunc");
const Types_1 = require("../src/Types");
ava_1.default.cb("Can map", (tst) => {
    let input = {
        record: [
            {
                gpgKey: 'g',
                filePartByteCountThreshold: 1024,
                sha256: "def8c",
                operation: Types_1.Operation.Create,
                fileByteCount: 600,
                modifiedDate: new Date("2017-06-19T06:20:05.168Z"),
                path: "/error_command",
                part: [22, 152],
            },
            {
                gpgKey: 'g',
                filePartByteCountThreshold: 1024,
                sha256: "def8c",
                operation: Types_1.Operation.Create,
                fileByteCount: 600,
                modifiedDate: new Date("2017-06-19T06:20:05.168Z"),
                path: "/error_command",
                part: [23, 152],
            },
            {
                gpgKey: 'g',
                filePartByteCountThreshold: 1024,
                sha256: "abc12",
                operation: Types_1.Operation.Create,
                fileByteCount: 200,
                modifiedDate: new Date("2017-06-19T02:00:05.000Z"),
                path: "/test-file",
                part: [2, 5],
            }
        ],
        gpgKey: 'gg',
        createdAt: new Date("2017-06-21:06:06.000Z"),
        commitId: "001",
        clientId: "client-id",
    };
    let expected = Object.assign({}, input, {
        relativeFilePath: 'c-001-gg-client--id.commit'
    });
    let expectedContents = [
        '["def8c",1,600,"22_152",1024,"2017-06-19T06:20:05.168Z","/error_command","g"]',
        '["def8c",1,600,"23_152",1024,"2017-06-19T06:20:05.168Z","/error_command","g"]',
        '["abc12",1,200,"2_5",1024,"2017-06-19T02:00:05.000Z","/test-file","g"]'
    ];
    let atomicFileWrite = (tmpPath, finalPath, contents) => {
        tst.is(path_1.dirname(tmpPath), '/tmp/ebak:test/tmp');
        tst.true(path_1.basename(tmpPath).length > 0);
        tst.is(finalPath, '/tmp/ebak:test/pending-commit/c-001-gg-client--id.commit');
        tst.deepEqual(contents, expectedContents);
        return Promise.resolve(finalPath);
    };
    let dirsCreated = [];
    let mkdirp = (p, next) => {
        dirsCreated.push(p);
        next(null);
    };
    let configDir = '/tmp/ebak:test';
    let commitToCommittedMapFunc = getCommitToCommittedMapFunc_1.getCommitToCommittedMapFunc({ mkdirp, atomicFileWrite }, configDir);
    commitToCommittedMapFunc(input, (err, val) => {
        tst.deepEqual(dirsCreated, ['/tmp/ebak:test/tmp', '/tmp/ebak:test/pending-commit']);
        tst.deepEqual(val, expected);
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tbWl0VG9Db21taXR0ZWRNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9nZXRDb21taXRUb0NvbW1pdHRlZE1hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUI7QUFDdkIsK0JBQStDO0FBQy9DLG9GQUF5RjtBQUV6Rix3Q0FBcUc7QUFHckcsYUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUV2QixJQUFJLEtBQUssR0FBVztRQUNoQixNQUFNLEVBQUU7WUFDSjtnQkFDSSxNQUFNLEVBQUUsR0FBRztnQkFDWCwwQkFBMEIsRUFBRSxJQUFJO2dCQUNoQyxNQUFNLEVBQUUsT0FBTztnQkFDZixTQUFTLEVBQUUsaUJBQVMsQ0FBQyxNQUFNO2dCQUMzQixhQUFhLEVBQUUsR0FBRztnQkFDbEIsWUFBWSxFQUFFLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDO2dCQUNsRCxJQUFJLEVBQUUsZ0JBQWdCO2dCQUN0QixJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDO2FBQ2xCO1lBQ0Q7Z0JBQ0ksTUFBTSxFQUFFLEdBQUc7Z0JBQ1gsMEJBQTBCLEVBQUUsSUFBSTtnQkFDaEMsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsU0FBUyxFQUFFLGlCQUFTLENBQUMsTUFBTTtnQkFDM0IsYUFBYSxFQUFFLEdBQUc7Z0JBQ2xCLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztnQkFDbEQsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQzthQUNsQjtZQUNEO2dCQUNJLE1BQU0sRUFBRSxHQUFHO2dCQUNYLDBCQUEwQixFQUFFLElBQUk7Z0JBQ2hDLE1BQU0sRUFBRSxPQUFPO2dCQUNmLFNBQVMsRUFBRSxpQkFBUyxDQUFDLE1BQU07Z0JBQzNCLGFBQWEsRUFBRSxHQUFHO2dCQUNsQixZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUM7Z0JBQ2xELElBQUksRUFBRSxZQUFZO2dCQUNsQixJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2Y7U0FDSjtRQUNELE1BQU0sRUFBRSxJQUFJO1FBQ1osU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDO1FBQzVDLFFBQVEsRUFBRSxLQUFLO1FBQ2YsUUFBUSxFQUFFLFdBQVc7S0FDeEIsQ0FBQztJQUVGLElBQUksUUFBUSxHQUFjLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRTtRQUMvQyxnQkFBZ0IsRUFBRSw0QkFBNEI7S0FDakQsQ0FBQyxDQUFDO0lBRUgsSUFBSSxnQkFBZ0IsR0FBRztRQUNuQiwrRUFBK0U7UUFDL0UsK0VBQStFO1FBQy9FLHdFQUF3RTtLQUMzRSxDQUFDO0lBRUYsSUFBSSxlQUFlLEdBQThHLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUM5SixHQUFHLENBQUMsRUFBRSxDQUFDLGNBQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQy9DLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN2QyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSwwREFBMEQsQ0FBQyxDQUFDO1FBQzlFLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUFDO0lBRUYsSUFBSSxXQUFXLEdBQTRCLEVBQUUsQ0FBQztJQUM5QyxJQUFJLE1BQU0sR0FBVyxDQUFDLENBQXdCLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDcEQsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDZixDQUFDLENBQUM7SUFDRixJQUFJLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztJQUVqQyxJQUFJLHdCQUF3QixHQUFHLHlEQUEyQixDQUN0RCxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUMsRUFDMUIsU0FBUyxDQUNaLENBQUM7SUFFRix3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDekMsR0FBRyxDQUFDLFNBQVMsQ0FDVCxXQUFXLEVBQ1gsQ0FBQyxvQkFBb0IsRUFBRSwrQkFBK0IsQ0FBQyxDQUMxRCxDQUFDO1FBQ0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDN0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9