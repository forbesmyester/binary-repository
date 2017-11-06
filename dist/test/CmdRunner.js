"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CmdRunner_1 = require("../src/CmdRunner");
const ava_1 = require("ava");
const streamdash_1 = require("streamdash");
ava_1.default('Can do basic test', (tst) => {
    let cmdRunner = new CmdRunner_1.CmdRunner({ cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({ NAME: "Matt" }) }, process.env, "./test/data", "./hello_command", ["Hello"], {});
    return streamdash_1.streamDataCollector(cmdRunner)
        .then((data) => {
        tst.deepEqual(data, [{ name: 'stdout', text: 'Hello Matt' }]);
    })
        .catch((err) => {
        tst.fail();
    });
});
ava_1.default.cb('Can do fail test', (tst) => {
    let cmdRunner = new CmdRunner_1.CmdRunner({ cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner() }, process.env, "./test/data", "./error_command", [], {});
    streamdash_1.streamDataCollector(cmdRunner, (err, data) => {
        tst.true((err instanceof CmdRunner_1.ExitStatusError));
        tst.deepEqual(err.code, 2);
        tst.deepEqual(data, [
            { name: 'stdout', text: 'HI THERE' },
            { name: 'stderr', text: 'HI ERROR' }
        ]);
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ21kUnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9DbWRSdW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBcUY7QUFDckYsNkJBQXVCO0FBQ3ZCLDJDQUFpRDtBQUVqRCxhQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUU5QixJQUFJLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQ3pCLEVBQUUsVUFBVSxFQUFFLHFCQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFDakMsT0FBTyxDQUFDLEdBQUcsRUFDbEMsYUFBYSxFQUNiLGlCQUFpQixFQUNqQixDQUFDLE9BQU8sQ0FBQyxFQUNULEVBQUUsQ0FDTCxDQUFDO0lBRUYsTUFBTSxDQUFDLGdDQUFtQixDQUFZLFNBQVMsQ0FBQztTQUMzQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNYLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEUsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDWCxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZixDQUFDLENBQUMsQ0FBQztBQUdYLENBQUMsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBRWhDLElBQUksU0FBUyxHQUFHLElBQUkscUJBQVMsQ0FDekIsRUFBRSxVQUFVLEVBQUUscUJBQVMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUNsQixPQUFPLENBQUMsR0FBRyxFQUNsQyxhQUFhLEVBQ2IsaUJBQWlCLEVBQ2pCLEVBQUUsRUFDRixFQUFFLENBQ0wsQ0FBQztJQUVGLGdDQUFtQixDQUFZLFNBQVMsRUFBRSxDQUFDLEdBQW9CLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDckUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsWUFBWSwyQkFBZSxDQUFDLENBQUMsQ0FBQztRQUMzQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUU7WUFDaEIsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDcEMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7U0FDdkMsQ0FBQyxDQUFDO1FBQ0gsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFHUCxDQUFDLENBQUMsQ0FBQyJ9