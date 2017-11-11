import { ExitStatusError, CmdRunner, CmdOutput } from '../src/CmdRunner';
import test from 'ava';
import { streamDataCollector } from 'streamdash';

test('Can do basic test', (tst) => {

    let cmdRunner = new CmdRunner(
        { cmdSpawner: CmdRunner.getCmdSpawner({ NAME: "Matt"}) },
        <{[k: string]: string}>process.env,
        "./test/data",
        "./hello_command",
        ["Hello"],
        {}
    );

    return streamDataCollector<CmdOutput>(cmdRunner)
        .then((data) => {
            tst.deepEqual(data, [{name: 'stdout', text: 'Hello Matt'}]);
        })
        .catch((err) => {
            tst.fail();
        });


});

test.cb('Can do fail test', (tst) => {

    let cmdRunner = new CmdRunner(
        { cmdSpawner: CmdRunner.getCmdSpawner() },
        <{[k: string]: string}>process.env,
        "./test/data",
        "./error_command",
        [],
        {}
    );

    streamDataCollector<CmdOutput>(cmdRunner, (err: ExitStatusError, data) => {
        tst.true((err instanceof ExitStatusError));
        tst.deepEqual(err.code, 2);
        tst.deepEqual(data, [
            { name: 'stdout', text: 'HI THERE' },
            { name: 'stderr', text: 'HI ERROR' }
        ]);
        tst.end();
    });


});
