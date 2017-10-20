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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9GaWxlTWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvZ2V0VG9GaWxlTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUl2Qiw4REFBZ0Q7QUFFaEQsd0NBQXdPO0FBRXhPLGtCQUFrQixJQUFzQixFQUFFLElBQW1CLEVBQUUsT0FBTyxHQUFHLElBQUk7SUFDekUsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUM3QyxNQUFNLENBQUM7UUFDSCxNQUFNLEVBQUUsZ0JBQWdCO1FBQ3hCLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFNBQVMsRUFBRSxDQUFDO1FBQ1osUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsQ0FBQztnQkFDTCxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsU0FBUyxFQUFFLGlCQUFTLENBQUMsTUFBTTtnQkFDM0IsMEJBQTBCLEVBQUUsSUFBSTtnQkFDaEMsYUFBYSxFQUFFLEdBQUc7Z0JBQ2xCLFlBQVksRUFBRSxDQUFDO2dCQUNmLElBQUksRUFBRSxJQUFJO2dCQUNWLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxJQUFJO2dCQUNYLElBQUksRUFBRSxJQUFJO2dCQUNWLE9BQU87YUFDVixDQUFDO0tBQ0wsQ0FBQztBQUVOLENBQUM7QUFFRCxhQUFJLENBQUMsRUFBRSxDQUFDLDBCQUEwQixFQUFFLENBQUMsR0FBRztJQUVwQyxJQUFJLElBQUksR0FBRztRQUNQLE1BQU0sRUFBRSxDQUFDO1FBQ1QsT0FBTyxFQUFFLENBQUM7UUFDVixNQUFNLEVBQUUsQ0FBQztRQUNULE1BQU0sRUFBRSxDQUFDO1FBQ1QsTUFBTSxFQUFFLENBQUM7S0FDWixDQUFDO0lBRUYsSUFBSSxDQUFDLEdBQUcsUUFBUSxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FB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