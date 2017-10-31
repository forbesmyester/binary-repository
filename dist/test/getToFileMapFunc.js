"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const getToFileMapFunc_1 = require("../src/getToFileMapFunc");
const Types_1 = require("../src/Types");
function getInput(path, part, proceed = true) {
    let d = new Date('2017-07-22T17:02:48.000Z');
    return {
        gpgKey: 'commit-gpg-key',
        clientId: 'notme',
        createdAt: d,
        commitId: 'Xb',
        record: [{
                gpgKey: 'gpg-key',
                sha256: 'sha',
                operation: Types_1.Operation.Create,
                filePartByteCountThreshold: 1024,
                fileByteCount: 200,
                modifiedDate: d,
                path: path,
                part: part,
                local: null,
                stat: null,
                proceed
            }]
    };
}
ava_1.default.cb('Will skip if not proceed', (tst) => {
    let done = {
        rename: 0,
        decrypt: 0,
        mkdirp: 1,
        unlink: 0,
        utimes: 0
    };
    let e = () => { throw new Error("Should not be here"); };
    let deps = {
        utimes: e,
        unlink: e,
        decrypt: e,
        rename: (s, d, n) => {
            tst.is(s, '/store/.ebak/remote-pending-commit/c-Xb-commit--gpg--key-notme.commit');
            tst.is(d, '/store/.ebak/remote-commit/c-Xb-commit--gpg--key-notme.commit');
            done.rename = done.rename + 1;
            n(null);
        },
        mkdirp: (p, n) => {
            tst.is(p, '/store/.ebak/remote-commit');
            n(null);
        }
    };
    let mf = getToFileMapFunc_1.default(deps, '/store/.ebak', '/store');
    mf(getInput('Docs/a.txt', [2, 2], false), (e, r) => {
        tst.is(done.utimes, 0);
        tst.is(done.decrypt, 0);
        tst.is(done.mkdirp, 1);
        tst.is(done.rename, 1);
        tst.is(done.unlink, 0);
        tst.is(null, e);
        tst.deepEqual(r, getInput('Docs/a.txt', [2, 2], false));
        tst.end();
    });
});
ava_1.default.cb('Can unencrypt local FilePart', (tst) => {
    let done = {
        rename: 0,
        decrypt: 0,
        mkdirp: 0,
        unlink: 0,
        utimes: 0
    };
    let deps = {
        utimes: (f, atime, mtime, next) => {
            done.utimes = done.utimes + 1;
            tst.is(f, '/store/Docs/a.txt');
            tst.is(atime, 1500742968);
            tst.is(mtime, 1500742968);
            next(null);
        },
        rename: (oldFn, newFn, next) => {
            let expected = {
                oldFn: [
                    '/store/.ebak/tmp/sha.ebak.dec',
                    '/store/.ebak/remote-pending-commit/c-Xb-commit--gpg--key-notme.commit'
                ],
                newFn: [
                    '/store/Docs/a.txt',
                    '/store/.ebak/remote-commit/c-Xb-commit--gpg--key-notme.commit'
                ]
            };
            tst.is(oldFn, expected.oldFn[done.rename]);
            tst.is(newFn, expected.newFn[done.rename]);
            done.rename = done.rename + 1;
            next(null);
        },
        mkdirp: (p, n) => {
            let expected = [
                '/store/Docs',
                '/store/.ebak/remote-commit'
            ];
            tst.is(p, expected[done.mkdirp]);
            done.mkdirp = done.mkdirp + 1;
            n(null);
        },
        unlink: (path, next) => {
            let expected = [
                '/store/.ebak/remote-encrypted-filepart/f-sha-1-1KB-gpg--key.ebak',
                '/store/.ebak/remote-encrypted-filepart/f-sha-2-1KB-gpg--key.ebak'
            ];
            tst.deepEqual(path, expected[done.unlink]);
            done.unlink = done.unlink + 1;
            next(null);
        },
        decrypt: (gpgKey, src, dst, next) => {
            tst.is(gpgKey, 'gpg-key');
            tst.is(dst, '/store/.ebak/tmp/sha.ebak.dec');
            tst.deepEqual(src, [
                '/store/.ebak/remote-encrypted-filepart/f-sha-1-1KB-gpg--key.ebak',
                '/store/.ebak/remote-encrypted-filepart/f-sha-2-1KB-gpg--key.ebak'
            ]);
            done['decrypt'] = done['decrypt'] + 1;
            next(null);
        }
    };
    let mf = getToFileMapFunc_1.default(deps, '/store/.ebak', '/store');
    mf(getInput('Docs/a.txt', [2, 2]), (e, r) => {
        tst.is(done.utimes, 1);
        tst.is(done.decrypt, 1);
        tst.is(done.mkdirp, 2);
        tst.is(done.rename, 2);
        tst.is(done.unlink, 2);
        tst.is(null, e);
        tst.deepEqual(r, getInput('Docs/a.txt', [2, 2]));
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9GaWxlTWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvZ2V0VG9GaWxlTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUl2Qiw4REFBZ0Q7QUFFaEQsd0NBQXdPO0FBRXhPLGtCQUFrQixJQUFzQixFQUFFLElBQW1CLEVBQUUsT0FBTyxHQUFHLElBQUk7SUFDekUsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUM3QyxNQUFNLENBQUM7UUFDSCxNQUFNLEVBQUUsZ0JBQWdCO1FBQ3hCLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFNBQVMsRUFBRSxDQUFDO1FBQ1osUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsQ0FBQztnQkFDTCxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsU0FBUyxFQUFFLGlCQUFTLENBQUMsTUFBTTtnQkFDM0IsMEJBQTBCLEVBQUUsSUFBSTtnQkFDaEMsYUFBYSxFQUFFLEdBQUc7Z0JBQ2xCLFlBQVksRUFBRSxDQUFDO2dCQUNmLElBQUksRUFBRSxJQUFJO2dCQUNWLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxJQUFJO2dCQUNYLElBQUksRUFBRSxJQUFJO2dCQUNWLE9BQU87YUFDVixDQUFDO0tBQ0wsQ0FBQztBQUVOLENBQUM7QUFFRCxhQUFJLENBQUMsRUFBRSxDQUFDLDBCQUEwQixFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFFeEMsSUFBSSxJQUFJLEdBQUc7UUFDUCxNQUFNLEVBQUUsQ0FBQztRQUNULE9BQU8sRUFBRSxDQUFDO1FBQ1YsTUFBTSxFQUFFLENBQUM7UUFDVCxNQUFNLEVBQUUsQ0FBQztRQUNULE1BQU0sRUFBRSxDQUFDO0tBQ1osQ0FBQztJQUVGLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMs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