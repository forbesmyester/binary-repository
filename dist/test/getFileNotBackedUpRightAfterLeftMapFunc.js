"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const getFileNotBackedUpRightAfterLeftMapFunc_1 = require("../src/getFileNotBackedUpRightAfterLeftMapFunc");
const ramda_1 = require("ramda");
ava_1.default("Can join based on files missing / out of date in db", (tst) => {
    let leftDbData = [{
            "error_command": { "modifiedDate": new Date("2017-06-24T10:46:12.432Z"),
                "fileByteCount": 58,
                "sha256": "ef28ddadd99fbab0f8ff875df2051b6d6061a660ab72b7b33cf45b28fb3d8098"
            },
            "hello_command": {
                "modifiedDate": new Date("2017-06-25T14:47:13.856Z"),
                "fileByteCount": 29,
                "sha256": "8cf0f7cceaf3e0cc1d575000f305b2d10fdb6c5d35e5007496b8589e0d7046bb"
            },
            "bye_comand": {
                "modifiedDate": new Date("2017-06-27T14:47:13.856Z"),
                "fileByteCount": 29,
                "sha256": "8cf0f7cceaf3e0cc1d575000f305b2d10fdb6c5d35e5007496b8589e0d7046bb"
            }
        }];
    let rightFileData = [
        { path: "error_command", fileByteCount: 58, modifiedDate: new Date("2017-06-24T10:46:12.432Z") },
        { path: "hello_command", fileByteCount: 29, modifiedDate: new Date("2017-06-26T14:47:13.856Z") },
        { path: "bye_command", fileByteCount: 111, modifiedDate: new Date("2017-06-27T14:47:13.856Z") },
        { path: "another_file", fileByteCount: 1, modifiedDate: new Date("2017-06-26T14:47:13.856Z") }
    ];
    let expected = [
        [],
        [{ path: "hello_command", fileByteCount: 29, modifiedDate: new Date("2017-06-26T14:47:13.856Z") }],
        [{ path: "bye_command", fileByteCount: 111, modifiedDate: new Date("2017-06-27T14:47:13.856Z") }],
        [{ path: "another_file", fileByteCount: 1, modifiedDate: new Date("2017-06-26T14:47:13.856Z") }]
    ];
    let fileNotBackedUpRightAfterLeftMapFunc = getFileNotBackedUpRightAfterLeftMapFunc_1.default({});
    let result = ramda_1.map(fileNotBackedUpRightAfterLeftMapFunc.bind(null, leftDbData), rightFileData);
    tst.deepEqual(result, expected);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RmlsZU5vdEJhY2tlZFVwUmlnaHRBZnRlckxlZnRNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9nZXRGaWxlTm90QmFja2VkVXBSaWdodEFmdGVyTGVmdE1hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUI7QUFHdkIsNEdBQXFHO0FBQ3JHLGlDQUE0QjtBQUc1QixhQUFJLENBQUMscURBQXFELEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUVoRSxJQUFJLFVBQVUsR0FBRyxDQUFDO1lBQ2QsZUFBZSxFQUFFLEVBQUMsY0FBYyxFQUFFLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDO2dCQUNsRSxlQUFlLEVBQUUsRUFBRTtnQkFDbkIsUUFBUSxFQUFFLGtFQUFrRTthQUMvRTtZQUNELGVBQWUsRUFBRTtnQkFDYixjQUFjLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUM7Z0JBQ3BELGVBQWUsRUFBRSxFQUFFO2dCQUNuQixRQUFRLEVBQUUsa0VBQWtFO2FBQy9FO1lBQ0QsWUFBWSxFQUFFO2dCQUNWLGNBQWMsRUFBRSxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztnQkFDcEQsZUFBZSxFQUFFLEVBQUU7Z0JBQ25CLFFBQVEsRUFBRSxrRUFBa0U7YUFDL0U7U0FDSixDQUFDLENBQUM7SUFFSCxJQUFJLGFBQWEsR0FBVztRQUN4QixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsRUFBRTtRQUNoRyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsRUFBRTtRQUNoRyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsRUFBRTtRQUMvRixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsRUFBRTtLQUNqRyxDQUFDO0lBRUYsSUFBSSxRQUFRLEdBQWE7UUFDckIsRUFBRTtRQUNGLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLEVBQUUsQ0FBQztRQUNsRyxDQUFDLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLENBQUM7UUFDakcsQ0FBQyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsRUFBRSxDQUFDO0tBQ25HLENBQUM7SUFFRixJQUFJLG9DQUFvQyxHQUFHLGlEQUF1QyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXZGLElBQUksTUFBTSxHQUFhLFdBQUcsQ0FDdEIsb0NBQW9DLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsRUFDM0QsYUFBYSxDQUNoQixDQUFDO0lBRUYsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFFcEMsQ0FBQyxDQUFDLENBQUMifQ==