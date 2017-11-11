"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const getNotInLeftRightAfterLeftMapFunc_1 = require("../src/getNotInLeftRightAfterLeftMapFunc");
const ramda_1 = require("ramda");
ava_1.default("Will", (tst) => {
    let leftDbData = [
        { filename: "X1" },
        { filename: "X4", otherKey: 'zzz' },
        { filename: "X3" },
        { filename: "X6" },
    ];
    let rightData = [
        { filename: "X1" },
        { filename: "X2" },
        { filename: "X3" },
        { filename: "X4" },
        { filename: "X5" },
        { filename: "X6" },
    ];
    let expected = [
        [],
        [{ filename: "X2" }],
        [],
        [],
        [{ filename: "X5" }],
        [],
    ];
    let mapper = getNotInLeftRightAfterLeftMapFunc_1.default({});
    let result = ramda_1.map(mapper.bind(null, leftDbData), rightData);
    tst.deepEqual(result, expected);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Tm90SW5MZWZ0UmlnaHRBZnRlckxlZnRNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9nZXROb3RJbkxlZnRSaWdodEFmdGVyTGVmdE1hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUI7QUFDdkIsZ0dBQW9FO0FBQ3BFLGlDQUE0QjtBQUc1QixhQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFFakIsSUFBSSxVQUFVLEdBQUc7UUFDYixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7UUFDbEIsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7UUFDbkMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1FBQ2xCLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtLQUNyQixDQUFDO0lBRUYsSUFBSSxTQUFTLEdBQUc7UUFDWixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7UUFDbEIsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1FBQ2xCLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtRQUNsQixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7UUFDbEIsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1FBQ2xCLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtLQUNyQixDQUFDO0lBRUYsSUFBSSxRQUFRLEdBQUc7UUFDWCxFQUFFO1FBQ0YsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUNwQixFQUFFO1FBQ0YsRUFBRTtRQUNGLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDcEIsRUFBRTtLQUNMLENBQUM7SUFFRixJQUFJLE1BQU0sR0FBRywyQ0FBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTlCLElBQUksTUFBTSxHQUFHLFdBQUcsQ0FDWixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsRUFDN0IsU0FBUyxDQUNaLENBQUM7SUFFRixHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUVwQyxDQUFDLENBQUMsQ0FBQyJ9