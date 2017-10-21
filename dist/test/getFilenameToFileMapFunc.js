"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const getFilenameToFileMapFunc_1 = require("../src/getFilenameToFileMapFunc");
const fs_1 = require("fs");
const path_1 = require("path");
ava_1.default.cb("Can map", (tst) => {
    let mf = getFilenameToFileMapFunc_1.getFilenameToFileMapFunc({ stat: fs_1.stat }, __dirname);
    let fiveYear = 1000 * 60 * 60 * 24 * 365 * 5;
    mf({ path: path_1.basename(__filename) }, (err, f) => {
        tst.is(err, null);
        tst.true(f.fileByteCount > 0, "No byteCount");
        tst.true(f.modifiedDate.getTime() < (new Date()).getTime(), "How can a file be created in the future?");
        tst.true(f.modifiedDate.getTime() > (new Date()).getTime() - fiveYear, "Over 5 years old? Maybe?");
        tst.end();
    });
});
ava_1.default.cb("Can convert a File to Sha256File", (tst) => {
    let mf = getFilenameToFileMapFunc_1.getFilenameToFileMapFunc({ stat: fs_1.stat }, ".");
    mf({ path: "Non Existant Filename" }, (err, f) => {
        tst.truthy(err);
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RmlsZW5hbWVUb0ZpbGVNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9nZXRGaWxlbmFtZVRvRmlsZU1hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUI7QUFDdkIsOEVBQTJFO0FBRzNFLDJCQUEwQjtBQUMxQiwrQkFBZ0M7QUFFaEMsYUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHO0lBRW5CLElBQUksRUFBRSxHQUFHLG1EQUF3QixDQUFDLEVBQUUsSUFBSSxFQUFKLFNBQUksRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZELElBQUksUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBRTdDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFPO1FBQzVDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xCLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDOUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLDBDQUEwQyxDQUFDLENBQUM7UUFDeEcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLFFBQVEsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1FBQ25HLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsRUFBRSxDQUFDLGtDQUFrQyxFQUFFLENBQUMsR0FBRztJQUU1QyxJQUFJLEVBQUUsR0FBRyxtREFBd0IsQ0FBQyxFQUFFLElBQUksRUFBSixTQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUVqRCxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEIsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsQ0FBQyJ9