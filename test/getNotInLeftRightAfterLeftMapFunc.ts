import test from 'ava';
import { asyncMap } from 'streamdash';
import { File } from '../src/Types';
import getNotInLeft from '../src/getNotInLeftRightAfterLeftMapFunc';
import { map } from 'ramda';


test("Will", (tst) => {

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

    let mapper = getNotInLeft({});

    let result = map(
        mapper.bind(null, leftDbData),
        rightData,
    );

    tst.deepEqual(result, expected);

});
