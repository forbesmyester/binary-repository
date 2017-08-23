import { ExitStatusError, CmdSpawner, CmdRunner, CmdOutput } from '../src/CmdRunner';
import { CmdOutputDidNotMatchError, singleLineCmdRunner } from '../src/singleLineCmdRunner';
import test from 'ava';
import { streamDataCollector } from 'streamdash';

test.cb('Can do basic test', (tst) => {
    let cmdSpawner = CmdRunner.getCmdSpawner({});
    let f = singleLineCmdRunner({cmdSpawner}, "echo", /^Hello\s+(.*)/);
    f("Hello Matt", (err, result) => {
        tst.is(err, null);
        tst.is(result, "Matt");
        tst.end();
    });
});

test.cb('Can fail', (tst) => {
    let cmdSpawner = CmdRunner.getCmdSpawner({});
    let re = /^Hello\s+(.*)/;
    let f = singleLineCmdRunner({cmdSpawner}, "echo", re);
    f("Hi Matt", (err, result) => {
        tst.is(
            (<CmdOutputDidNotMatchError>err).message,
            'No lines matching \'^Hello\\s+(.*)\' found'
        );
        tst.is((<CmdOutputDidNotMatchError>err).re, re);
        tst.deepEqual(
            (<CmdOutputDidNotMatchError>err).output,
            [{name: 'stdout', text: 'Hi Matt'}]
        );
        tst.is(result, undefined);
        tst.end();
    });
});
