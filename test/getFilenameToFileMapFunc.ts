import test from 'ava';
import { getFilenameToFileMapFunc } from '../src/getFilenameToFileMapFunc';
import { File } from '../src/Types';
import { stat } from 'fs';
import { basename } from 'path';

test.cb("Can map", (tst) => {

    let mf = getFilenameToFileMapFunc({ stat }, __dirname);
    let fiveYear = 1000 * 60 * 60 * 24 * 365 * 5;

    mf({ path: basename(__filename) }, (err, f: File) => {
        tst.is(err, null);
        tst.true(f.fileByteCount > 0, "No byteCount");
        tst.true(f.modifiedDate.getTime() < (new Date()).getTime(), "How can a file be created in the future?");
        tst.true(f.modifiedDate.getTime() > (new Date()).getTime() - fiveYear, "Over 5 years old? Maybe?");
        tst.end();
    });

});

test.cb("Can convert a File to Sha256File", (tst) => {

    let mf = getFilenameToFileMapFunc({ stat }, ".");

    mf({ path: "Non Existant Filename" }, (err, f) => {
        tst.truthy(err);
        tst.end();
    });

});

