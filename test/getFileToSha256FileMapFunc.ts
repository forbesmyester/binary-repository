import test from 'ava';
import { getFileToSha256FileMapFunc, getRunner } from '../src/getFileToSha256FileMapFunc';
import { CmdRunner } from '../src/CmdRunner';
import { AbsoluteFilePath, Sha256 } from '../src/Types';
import { MapFunc } from 'streamdash';

test.cb("Can get a command runner", (tst) => {

    let cmdSpawner = CmdRunner.getCmdSpawner({});
    let runner = getRunner({ cmdSpawner });

    runner(__filename, (err, result: Sha256) => {
        tst.is(err, null);
        tst.regex(result, /^[a-z0-9]{64}/);
        tst.end();
    });

});

test.cb("Can convert a File to Sha256File", (tst) => {

    let mf: MapFunc<AbsoluteFilePath, Sha256> = (f: AbsoluteFilePath, next) => {
        next(null, "SHA256");
    };
    let d = new Date();
    let f = getFileToSha256FileMapFunc({ runner: mf }, "./test/..");

    f({ path: "README.md", fileByteCount: 1, modifiedDate: d }, (err, result) => {
        tst.is(err, null);
        tst.deepEqual(
            result,
            { path: "README.md", fileByteCount: 1, modifiedDate: d, sha256: "SHA256" }
        );
        tst.end();
    });

});
