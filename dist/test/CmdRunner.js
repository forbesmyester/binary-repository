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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ21kUnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9DbWRSdW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBcUY7QUFDckYsNkJBQXVCO0FBQ3ZCLDJDQUFpRDtBQUVqRCxhQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxHQUFHO0lBRTFCLElBQUksU0FBUyxHQUFHLElBQUkscUJBQVMsQ0FDekIsRUFBRSxVQUFVLEVBQUUscUJBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUNqQyxPQUFPLENBQUMsR0FBRyxFQUNsQyxhQUFhLEVBQ2IsaUJBQWlCLEVBQ2pCLENBQUMsT0FBTyxDQUFDLEVBQ1QsRUFBRSxDQUNMLENBQUM7SUFFRixNQUFNLENBQUMsZ0NBQW1CLENBQVksU0FBUyxDQUFDO1NBQzNDLElBQUksQ0FBQyxDQUFDLElBQUk7UUFDUCxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUMsQ0FBQztTQUNELEtBQUssQ0FBQyxDQUFDLEdBQUc7UUFDUCxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZixDQUFDLENBQUMsQ0FBQztBQUdYLENBQUMsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEdBQUc7SUFFNUIsSUFBSSxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUN6QixFQUFFLFVBQVUsRUFBRSxxQkFBUyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQ2xCLE9BQU8sQ0FBQyxHQUFHLEVBQ2xDLGFBQWEsRUFDYixpQkFBaUIsRUFDakIsRUFBRSxFQUNGLEVBQUUsQ0FDTCxDQUFDO0lBRUYsZ0NBQW1CLENBQVksU0FBUyxFQUFFLENBQUMsR0FBb0IsRUFBRSxJQUFJO1FBQ2pFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFlBQVksMkJBQWUsQ0FBQyxDQUFDLENBQUM7UUFDM0MsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNCLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFO1lBQ2hCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ3BDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO1NBQ3ZDLENBQUMsQ0FBQztRQUNILEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBR1AsQ0FBQyxDQUFDLENBQUMifQ==