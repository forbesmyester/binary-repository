import test from 'ava';
import safeSize from '../src/safeSize';


test("do it", (tst) => {

    tst.is(safeSize(1048576), true); // 1M
    tst.is(safeSize(1024), true); // 1K
    tst.is(safeSize(2222), false); // Just wierd
    tst.is(safeSize(512), false); // Too small (0.5K)
    tst.is(safeSize(5242880), true); // 5M
    tst.is(safeSize(5242881), false); // 5M + 1B
    tst.is(safeSize(5242879), false); // 5M - 1B
    tst.is(safeSize(5241856), false); // 5M - 1K
    tst.is(safeSize(1073741824), true); // 1G (Max)
    tst.is(safeSize(1073741824 * 2), false); // 2G (above max - due to laziness)
});

