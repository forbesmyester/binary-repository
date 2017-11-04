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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ21kUnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9DbWRSdW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBcUY7QUFDckYsNkJBQXVCO0FBQ3ZCLDJDQUFpRDtBQUVqRCxhQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxHQUFHO0lBRTFCLElBQUksU0FBUyxHQUFHLElBQUkscUJBQVMsQ0FDekIsRUFBRSxVQUFVLEVBQUUscUJBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUN4RCxPQUFPLENBQUMsR0FBRyxFQUNYLGFBQWEsRUFDYixpQkFBaUIsRUFDakIsQ0FBQyxPQUFPLENBQUMsRUFDVCxFQUFFLENBQ0wsQ0FBQztJQUVGLE1BQU0sQ0FBQyxnQ0FBbUIsQ0FBWSxTQUFTLENBQUM7U0FDM0MsSUFBSSxDQUFDLENBQUMsSUFBSTtRQUNQLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEUsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLENBQUMsR0FBRztRQUNQLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0FBR1gsQ0FBQyxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsR0FBRztJQUU1QixJQUFJLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQ3pCLEVBQUUsVUFBVSxFQUFFLHFCQUFTLENBQUMsYUFBYSxFQUFFLEVBQUUsRUFDekMsT0FBTyxDQUFDLEdBQUcsRUFDWCxhQUFhLEVBQ2IsaUJBQWlCLEVBQ2pCLEVBQUUsRUFDRixFQUFFLENBQ0wsQ0FBQztJQUVGLGdDQUFtQixDQUFZLFNBQVMsRUFBRSxDQUFDLEdBQW9CLEVBQUUsSUFBSTtRQUNqRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZLDJCQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzNDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtZQUNoQixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNwQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtTQUN2QyxDQUFDLENBQUM7UUFDSCxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztBQUdQLENBQUMsQ0FBQyxDQUFDIn0=