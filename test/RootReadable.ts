import { Callback, RootReadable } from '../src/RootReadable';
import test from 'ava';
import { range } from 'ramda';

test.cb('Can scan a directory', (tst) => {

    let globber = (root, pattern, ignore, next: Callback<string[]>) => {
        setTimeout(() => {
            next(new Error("XXX"), range(0, 100).map(n => "a" + n, ));
        }, 200);
    };

    let rootReader = new RootReadable({glob: globber}, './test/data', []);

    let error: Error|null = null;
    let data: string[] = [];

    rootReader.on('end', () => {
        tst.is(data.length, 100);
        tst.is(true, rootReader.readBeforeData);
        tst.is(true, rootReader.readAfterData);
        tst.is((<Error>error).message, "XXX");
        tst.end();
    });

    rootReader.on('error', (e) => {
        error = e;
    });

    rootReader.on('data', (d: string) => {
        data.push(d);
    });


});
