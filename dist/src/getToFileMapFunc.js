"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = require("./Client");
const streamdash_1 = require("streamdash");
const path_1 = require("path");
const mkdirp = require("mkdirp");
const fs_1 = require("fs");
const async_1 = require("async");
const ramda_1 = require("ramda");
const CmdRunner_1 = require("./CmdRunner");
function _getDependenciesDecryptMapper(gpgKey, src, dst, isFirst) {
    return function (next) {
        let cmdSpawner = CmdRunner_1.CmdRunner.getCmdSpawner();
        let env = {
            OPT_SRC: src,
            OPT_DST: dst,
            OPT_GPG_KEY: gpgKey,
            OPT_IS_FIRST: isFirst ? "1" : "0"
        };
        let cmdRunner = new CmdRunner_1.CmdRunner({ cmdSpawner: cmdSpawner }, Object.assign(env, process.env), ".", 'bash/decrypt', [], {});
        let sdc = streamdash_1.streamDataCollector(cmdRunner).then((lines) => { next(null); }).catch(next);
    };
}
function getDependencies() {
    return {
        utimes: fs_1.utimes,
        rename: fs_1.rename,
        mkdirp,
        unlink: fs_1.unlink,
        decrypt: (gpgKey, srcs, dst, next) => {
            let acc = [];
            let tasks = srcs.reduce((acc, s) => {
                let r = _getDependenciesDecryptMapper(gpgKey, s, dst, acc.length == 0);
                acc.push(r);
                return acc;
            }, acc);
            async_1.waterfall(tasks, (e) => { next(e); });
        }
    };
}
exports.getDependencies = getDependencies;
let myUnlink = (realUnlink, f, next) => {
    realUnlink(f, (e) => {
        if (e && (e.code == 'ENOENT')) {
            return next(null);
        }
        next(e);
    });
};
function getToFile({ utimes, rename, mkdirp, unlink, decrypt }, configDir, rootDir) {
    function generateDecryptedFilename(rec) {
        return path_1.join(configDir, 'tmp', rec.sha256 + '.ebak.dec');
    }
    function generateOriginalEncryptedFilename(rec) {
        return path_1.join(configDir, 'remote-encrypted-filepart', Client_1.default.constructFilepartFilename(rec.sha256, rec.part, rec.filePartByteCountThreshold, rec.gpgKey));
    }
    ;
    function generateFinalFilename(rec) {
        return path_1.join(rootDir, rec.path);
    }
    function doUtimes(rec, next) {
        function convert(d) { return Math.floor(d.getTime() / 1000); }
        let mtime = convert(rec.modifiedDate), atime = convert(rec.modifiedDate);
        utimes(generateFinalFilename(rec), atime, mtime, (e) => {
            next(e, rec);
        });
    }
    function doDecrypt(rec, next) {
        let recs = ramda_1.map(part0 => {
            return ramda_1.assoc('part', [part0, rec.part[1]], rec);
        }, ramda_1.range(1, rec.part[1] + 1));
        decrypt(rec.gpgKey, ramda_1.map(generateOriginalEncryptedFilename, recs), generateDecryptedFilename(rec), (e) => { next(e, rec); });
    }
    function doRename(rec, next) {
        rename(generateDecryptedFilename(rec), generateFinalFilename(rec), (e) => {
            next(e, rec);
        });
    }
    function doMkdir(rec, next) {
        mkdirp(path_1.dirname(path_1.join(rootDir, rec.path)), e => {
            next(e, rec);
        });
    }
    function doUnlinkOne(rec, next) {
        myUnlink(unlink, generateOriginalEncryptedFilename(rec), (e) => {
            next(e, rec);
        });
    }
    function doUnlink(rec, next) {
        let recs = ramda_1.map(part0 => {
            return ramda_1.assoc('part', [part0, rec.part[1]], rec);
        }, ramda_1.range(1, rec.part[1] + 1));
        async_1.mapLimit(recs, 10, doUnlinkOne, (e) => {
            next(e, rec);
        });
    }
    function process(rec, next) {
        let tasks = [
            (innerNext) => {
                if (!rec.proceed) {
                    return next(null, rec);
                }
                innerNext(null, rec);
            },
            doDecrypt,
            doMkdir,
            doRename,
            doUtimes,
            doUnlink
        ];
        async_1.waterfall(tasks, next);
    }
    function finalize(a, next) {
        let oldFilename = path_1.join(configDir, 'remote-pending-commit', Client_1.default.constructCommitFilename(a.commitId, a.gpgKey, a.clientId));
        let newFilename = path_1.join(configDir, 'remote-commit', Client_1.default.constructCommitFilename(a.commitId, a.gpgKey, a.clientId));
        mkdirp(path_1.dirname(newFilename), (e) => {
            if (e) {
                return next(e);
            }
            rename(oldFilename, newFilename, (e) => {
                next(e, a);
            });
        });
    }
    return function (a, next) {
        async_1.mapLimit(a.record, 3, process, (e, r) => {
            if (e) {
                return next(e);
            }
            finalize(a, next);
        });
    };
}
exports.default = getToFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9GaWxlTWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nZXRUb0ZpbGVNYXBGdW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EscUNBQThCO0FBRTlCLDJDQUFpRDtBQUNqRCwrQkFBcUM7QUFDckMsaUNBQWlDO0FBQ2pDLDJCQUE0QztBQUM1QyxpQ0FBMkQ7QUFDM0QsaUNBQTBDO0FBQzFDLDJDQUEyRTtBQWMzRSx1Q0FBdUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTztJQUM1RCxNQUFNLENBQUMsVUFBUyxJQUFJO1FBQ2hCLElBQUksVUFBVSxHQUFlLHFCQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDdkQsSUFBSSxHQUFHLEdBQTBCO1lBQzdCLE9BQU8sRUFBRSxHQUFHO1lBQ1osT0FBTyxFQUFFLEdBQUc7WUFDWixXQUFXLEVBQUUsTUFBTTtZQUNuQixZQUFZLEVBQUUsT0FBTyxHQUFHLEdBQUcsR0FBRSxHQUFHO1NBQ25DLENBQUM7UUFDRixJQUFJLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQ3pCLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxFQUMxQixNQUFNLENBQUMsTUFBTSxDQUNULEdBQUcsRUFDSCxPQUFPLENBQUMsR0FBRyxDQUNkLEVBQ0QsR0FBRyxFQUNILGNBQWMsRUFDZCxFQUFFLEVBQ0YsRUFBRSxDQUNMLENBQUM7UUFDRixJQUFJLEdBQUcsR0FBRyxnQ0FBbUIsQ0FDekIsU0FBUyxDQUNaLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDLENBQUE7QUFDTCxDQUFDO0FBRUQ7SUFDSSxNQUFNLENBQUM7UUFDSCxNQUFNLEVBQU4sV0FBTTtRQUNOLE1BQU0sRUFBTixXQUFNO1FBQ04sTUFBTTtRQUNOLE1B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