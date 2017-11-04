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
        copyFile: e,
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
        copyFile: 0,
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
        copyFile: (oldFn, newFn, next) => {
            let expected = {
                oldFn: '/store/.ebak/tmp/sha.ebak.dec',
                newFn: '/store/Docs/a.txt',
            };
            done.copyFile = done.copyFile + 1;
            tst.is(oldFn, expected.oldFn);
            tst.is(newFn, expected.newFn);
            next(null);
        },
        rename: (oldFn, newFn, next) => {
            let expected = {
                oldFn: '/store/.ebak/remote-pending-commit/c-Xb-commit--gpg--key-notme.commit',
                newFn: '/store/.ebak/remote-commit/c-Xb-commit--gpg--key-notme.commit'
            };
            done.rename = done.rename + 1;
            tst.is(oldFn, expected.oldFn);
            tst.is(newFn, expected.newFn);
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
        tst.is(done.copyFile, 1);
        tst.is(done.unlink, 2);
        tst.is(null, e);
        tst.deepEqual(r, getInput('Docs/a.txt', [2, 2]));
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9GaWxlTWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvZ2V0VG9GaWxlTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUl2Qiw4REFBZ0Q7QUFFaEQsd0NBQXdPO0FBRXhPLGtCQUFrQixJQUFzQixFQUFFLElBQW1CLEVBQUUsT0FBTyxHQUFHLElBQUk7SUFDekUsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUM3QyxNQUFNLENBQUM7UUFDSCxNQUFNLEVBQUUsZ0JBQWdCO1FBQ3hCLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFNBQVMsRUFBRSxDQUFDO1FBQ1osUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsQ0FBQztnQkFDTCxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsU0FBUyxFQUFFLGlCQUFTLENBQUMsTUFBTTtnQkFDM0IsMEJBQTBCLEVBQUUsSUFBSTtnQkFDaEMsYUFBYSxFQUFFLEdBQUc7Z0JBQ2xCLFlBQVksRUFBRSxDQUFDO2dCQUNmLElBQUksRUFBRSxJQUFJO2dCQUNWLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxJQUFJO2dCQUNYLElBQUksRUFBRSxJQUFJO2dCQUNWLE9BQU87YUFDVixDQUFDO0tBQ0wsQ0FBQztBQUVOLENBQUM7QUFFRCxhQUFJLENBQUMsRUFBRSxDQUFDLDBCQUEwQixFQUFFLENBQUMsR0FBRztJQUVwQyxJQUFJLElBQUksR0FBRztRQUNQLE1BQU0sRUFBRSxDQUFDO1FBQ1QsT0FBTyxFQUFFLENBQUM7UUFDVixNQUFNLEVBQUUsQ0FBQztRQUNULE1BQU0sRUFBRSxDQUFDO1FBQ1QsTUFBTSxFQUFFLENBQUM7S0FDWixDQUFDO0lBRUYsSUFBSSxDQUFDLEdBQUcsUUFBUSxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FB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