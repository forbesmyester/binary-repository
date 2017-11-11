import test from 'ava';
import { Sha256FileToSha256FilePart } from '../src/Sha256FileToSha256FilePart';
import { streamDataCollector, ArrayReadable } from 'streamdash';
import { Sha256FilePart } from '../src/Types';

test("Can calculate parts", (tst) => {
    tst.deepEqual(
        Sha256FileToSha256FilePart.parts(0, 2),
        []
    );
    tst.deepEqual(
        Sha256FileToSha256FilePart.parts(9, 2),
        [[0, 2, false, [1, 5], 2], [2, 2, false, [2, 5], 2], [4, 2, false, [3, 5], 2], [6, 2, false, [4, 5], 2], [8, -1, true, [5, 5], 2]]
    );
    tst.deepEqual(
        Sha256FileToSha256FilePart.parts(1024, 1024),
        [[0, -1, true, [1, 1], 1024]]
    );
    tst.deepEqual(
        Sha256FileToSha256FilePart.parts(1066, 1024),
        [[0, 1024, false, [1, 2], 1024], [1024, -1, true, [2, 2], 1024]]
    );
});

test("Can break parts", (tst) => {

    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");

    let shaFiles = new ArrayReadable([{
        sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
        fileByteCount: 2048 ,
        modifiedDate,
        path: "//error_command"
    }]);

    let parter = new Sha256FileToSha256FilePart(1024, {objectMode: true});
    shaFiles.pipe(parter);

    return streamDataCollector<Sha256FilePart>(parter)
        .then((parts) => {
            let expected: Sha256FilePart[] = [
                {
                    sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
                    fileByteCount: 2048,
                    filePartByteCountThreshold: 1024,
                    length: 1024,
                    part: [1, 2],
                    offset: 0,
                    modifiedDate,
                    path: "//error_command",
                    isLast: false
                },
                {
                    sha256: "def8c702e06f7f6ac6576e0d4bbd830303aaa7d6857ee6c81c6d6a1b0a6c3bdf",
                    fileByteCount: 2048,
                    filePartByteCountThreshold: 1024,
                    length: -1,
                    part: [2, 2],
                    offset: 1024,
                    modifiedDate,
                    path: "//error_command",
                    isLast: true
                }
            ];

            tst.deepEqual(parts, expected);
        })
        .catch(e => {
            tst.fail(e.message);
        });


});
