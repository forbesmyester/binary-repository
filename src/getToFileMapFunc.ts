import { Operation, CommitId, NotificationHandler, RemotePendingCommitDownloadedRecord, RemotePendingCommitDownloaded, GpgKey, Callback, AbsoluteDirectoryPath, AbsoluteFilePath } from './Types';
import Client from './Client';
import { MapFunc } from 'streamdash';
import { streamDataCollector } from 'streamdash';
import { dirname, join } from 'path';
import * as mkdirp from 'mkdirp';
import { utimes, rename, copyFile, unlink } from 'fs';
import { mapLimit, waterfall } from 'async';
import { append, reduce, assoc, map, range } from 'ramda';
import { CmdSpawner, CmdRunner } from './CmdRunner';


export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}

interface DecryptionEnvironment {
    OPT_SRC: AbsoluteFilePath;
    OPT_GPG_KEY: GpgKey;
    OPT_DST: AbsoluteFilePath;
    OPT_IS_FIRST: string; // "1" or "0"
    OPT_INFO: string;
}

function getBashRoot(d: AbsoluteFilePath): AbsoluteDirectoryPath {
    return join(dirname(dirname(d)), 'bash');
}

function _getDependenciesDecryptMapper(gpgKey, src, dst, isFirst, info) {
    return function(next) {
        let cmdSpawner: CmdSpawner = CmdRunner.getCmdSpawner();
        let env: DecryptionEnvironment = {
            OPT_SRC: src,
            OPT_DST: dst,
            OPT_GPG_KEY: gpgKey,
            OPT_IS_FIRST: isFirst ? "1": "0",
            OPT_INFO: info
        };
        let cmdRunner = new CmdRunner(
            { cmdSpawner: cmdSpawner },
            Object.assign(
                {},
                <{[k:string]: string}>process.env,
                env
            ),
            ".",
            join(getBashRoot(__dirname), 'decrypt'),
            [],
            {}
        );
        streamDataCollector(
            cmdRunner
        ).then((lines) => {
            next(null);
        }).catch((e) => {
            next(e);
        });
    }
}

export function getDependencies(): Dependencies {
    return {
        utimes,
        copyFile,
        rename,
        mkdirp,
        unlink: unlink,
        decrypt: (gpgKey, srcs, dst, info, next) => {
            let acc: ((n: Callback<Error>) => void)[] = []; 
            let tasks = reduce((acc, s) => {
                let r = _getDependenciesDecryptMapper(gpgKey, s, dst, acc.length == 0, info);
                return append(r, acc);
            }, acc, srcs);
            waterfall(tasks, (e: Error|null) => { next(e) });
        }
    }
}


export interface Dependencies {
    utimes: (filename: AbsoluteFilePath, atime: number, mtime: number, next: Callback<void>) => void;
    copyFile: (src: AbsoluteFilePath, dest: AbsoluteFilePath, next: Callback<void>) => void;
    rename: (oldFn: AbsoluteFilePath, newFn: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
    unlink: (path: AbsoluteFilePath, next: Callback<void>) => void;
    decrypt: (gpgKey: GpgKey, src: AbsoluteFilePath[], dst: AbsoluteFilePath, info: string, next: Callback<void>) => void;
}


let myUnlink = (realUnlink, f, next) => {
    realUnlink(f, (e: NodeJS.ErrnoException) => {
        if (e && ( e.code == 'ENOENT' )) { return next(null); }
        next(e);
    });
};

export default function getToFile({copyFile, utimes, rename, mkdirp, unlink, decrypt}: Dependencies, configDir: AbsoluteDirectoryPath, rootDir: AbsoluteDirectoryPath, notificationHandler?: NotificationHandler, moveCommitFile: boolean = true): MapFunc<RemotePendingCommitDownloaded, RemotePendingCommitDownloaded> {

    function notify(id, status) {
        if (notificationHandler) {
            notificationHandler(id, status);
        }
    }

    function generateDecryptedFilename(rec: RemotePendingCommitDownloadedRecord) {
        return join(configDir, 'tmp', rec.sha256 + '.ebak.dec');
    }

    function generateOriginalEncryptedFilename(commitId: CommitId, rec: RemotePendingCommitDownloadedRecord) {
        return Client.constructFilepartLocalLocation(
            configDir,
            rec.gpgKey,
            commitId,
            rec
        );
    };

    function generateFinalFilename(rec: RemotePendingCommitDownloadedRecord) {
        return join(rootDir, rec.path);
    }


    function doUtimes(rec: RemotePendingCommitDownloadedRecord, next) {

        function convert(d: Date) { return Math.floor(d.getTime() / 1000); }
        let mtime = convert(rec.modifiedDate),
            atime = convert(rec.modifiedDate);
        notify(rec.path, 'Copying');
        utimes(generateFinalFilename(rec), atime, mtime, (e) => {
            notify(rec.path, 'Copied');
            next(e, rec);
        });
    }

    function doDecrypt(commitId: CommitId, rec: RemotePendingCommitDownloadedRecord, next) {

        let recs = map(part0 => {
            return assoc('part', [part0, rec.part[1]], rec);
        }, range(1, rec.part[1] + 1));

        notify(rec.path, 'Decrypting');
        decrypt(
            rec.gpgKey,
            map(
                generateOriginalEncryptedFilename.bind(
                    null,
                    commitId
                ),
                recs
            ),
            generateDecryptedFilename(rec),
            rec.path,
            (e) => {
                if (e) { return next(e); }
                notify(rec.path, 'Decrypted');
                next(e, rec);
            }
        );
    }

    function doCopy(rec: RemotePendingCommitDownloadedRecord, next) {
        copyFile(generateDecryptedFilename(rec), generateFinalFilename(rec), (e) => {
            if (e) { return next(e); }
            next(e, rec);
        });
    }

    function doMkdir(rec: RemotePendingCommitDownloadedRecord, next) {
        mkdirp(dirname(join(rootDir, rec.path)), e => {
            next(e, rec);
        });
    }

    function doUnlink(commitId: CommitId, rec: RemotePendingCommitDownloadedRecord, next: Callback<RemotePendingCommitDownloadedRecord>) {

        function doUnlinkOne(r: RemotePendingCommitDownloadedRecord, next) {
            myUnlink(unlink, generateOriginalEncryptedFilename(commitId, r), (e) => {
                notify(r.path, 'Finished');
                next(e, r);
            });
        }

        if (!rec.proceed) {
            return next(null, rec);
        }

        let recs = map(
            part0 => {
                return assoc('part', [part0, rec.part[1]], rec);
            },
            range(1, rec.part[1] + 1)
        );

        mapLimit(recs, 10, doUnlinkOne, (e: Error|null) => {
            myUnlink(unlink, generateDecryptedFilename(rec), (e) => {
                next(e, rec);
            });
        });
    }

    function process(commitId: CommitId, rec: RemotePendingCommitDownloadedRecord, next: Callback<RemotePendingCommitDownloadedRecord>) {

        if (rec.proceed && (rec.operation == Operation.Delete)) {
            notify(rec.path, 'Deleting');
            return myUnlink(unlink, generateFinalFilename(rec), (e) => {
                if (e) { return next(e, rec); }
                notify(rec.path, 'Deleted');
                next(null, rec);
            });
        }

        let downloadTasks = [
            (innerNext) => {
                if (!rec.proceed) {
                    return next(null, rec);
                }
                innerNext(null, rec);
            },
            doDecrypt.bind(null, commitId),
            doMkdir,
            doCopy,
            doUtimes,
        ];
        waterfall(downloadTasks, next);
    }

    function finalize(a: RemotePendingCommitDownloaded, next) {
        if (!moveCommitFile) { return next(null, a); }
        let oldFilename = join(
            configDir,
            'remote-pending-commit',
            Client.constructCommitFilename(
                a.commitId,
                a.gpgKey,
                a.clientId
            )
        );
        let newFilename = join(
            configDir,
            'remote-commit',
            Client.constructCommitFilename(
                a.commitId,
                a.gpgKey,
                a.clientId
            )
        );
        mkdirp(dirname(newFilename), (e) => {
            if (e) { return next(e); }
            rename(oldFilename, newFilename, (e) => {
                next(e, a);
            });
        });
    }

    return function(a: RemotePendingCommitDownloaded, next: Callback<RemotePendingCommitDownloaded>) {
        let du = (rec, cb: Callback<RemotePendingCommitDownloadedRecord>) => {
            if (rec.operation == Operation.Delete) {
                return cb(null, rec);
            }
            doUnlink(a.commitId, rec, cb);
        };
        let p = (rec, cb: Callback<RemotePendingCommitDownloadedRecord>) => {
            process(a.commitId, rec, cb);
        };
        mapLimit(
            a.record,
            3,
            p,
            (e, r) => {
                if (e) { return next(e); }
                mapLimit(a.record, 3, du, (e2, r2) => {
                    if (e2) { return next(e2); }
                    finalize(a, next);
                });
            }
        );
    };
}
