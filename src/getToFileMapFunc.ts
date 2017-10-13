import { RemotePendingCommitDownloadedRecord, RemotePendingCommitDownloaded, GpgKey, Callback, AbsoluteDirectoryPath, AbsoluteFilePath } from './Types';
import Client from './Client';
import { MapFunc } from 'streamdash';
import { streamDataCollector } from 'streamdash';
import { dirname, join } from 'path';
import * as mkdirp from 'mkdirp';
import { utimes, rename, unlink } from 'fs';
import { parallelLimit, mapLimit, waterfall } from 'async';
import { assoc, map, range } from 'ramda';
import { ExitStatus, CmdOutput, CmdSpawner, CmdRunner } from './CmdRunner';


export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}

interface DecryptionEnvironment {
    OPT_SRC: AbsoluteFilePath;
    OPT_GPG_KEY: GpgKey;
    OPT_DST: AbsoluteFilePath;
    OPT_IS_FIRST: string; // "1" or "0"
}

function _getDependenciesDecryptMapper(gpgKey, src, dst, isFirst) {
    return function(next) {
        let cmdSpawner: CmdSpawner = CmdRunner.getCmdSpawner();
        let env: DecryptionEnvironment = {
            OPT_SRC: src,
            OPT_DST: dst,
            OPT_GPG_KEY: gpgKey,
            OPT_IS_FIRST: isFirst ? "1": "0"
        };
        let cmdRunner = new CmdRunner(
            { cmdSpawner: cmdSpawner },
            Object.assign(
                env,
                process.env
            ),
            ".",
            'bash/decrypt',
            [],
            {}
        );
        let sdc = streamDataCollector(
            cmdRunner
        ).then((lines) => { next(null); }).catch(next);
    }
}

export function getDependencies(): Dependencies {
    return {
        utimes,
        rename,
        mkdirp,
        unlink: unlink,
        decrypt: (gpgKey, srcs, dst, next) => {
            let acc: ((n: Callback<Error>) => void)[] = []; 
            let tasks = srcs.reduce((acc, s) => {
                let r = _getDependenciesDecryptMapper(gpgKey, s, dst, acc.length == 0);
                acc.push(r);
                return acc;
            }, acc );
            waterfall(tasks, (e: Error|null) => { next(e) });
        }
    }
}


export interface Dependencies {
    utimes: (filename: AbsoluteFilePath, atime: number, mtime: number, next: Callback<void>) => void;
    rename: (oldFn: AbsoluteFilePath, newFn: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
    unlink: (path: AbsoluteFilePath, next: Callback<void>) => void;
    decrypt: (gpgKey: GpgKey, src: AbsoluteFilePath[], dst: AbsoluteFilePath, next: Callback<void>) => void;
}


let myUnlink = (realUnlink, f, next) => {
    realUnlink(f, (e: NodeJS.ErrnoException) => {
        if (e && ( e.code == 'ENOENT' )) { return next(null); }
        next(e);
    });
};

export default function getToFile({utimes, rename, mkdirp, unlink, decrypt}: Dependencies, gpgKey: GpgKey, configDir: AbsoluteDirectoryPath, rootDir: AbsoluteDirectoryPath): MapFunc<RemotePendingCommitDownloaded, RemotePendingCommitDownloaded> {

    function generateDecryptedFilename(rec: RemotePendingCommitDownloadedRecord) {
        return join(configDir, 'tmp', rec.sha256 + '.ebak.dec');
    }

    function generateOriginalEncryptedFilename(rec: RemotePendingCommitDownloadedRecord) {
        return join(
            configDir,
            'remote-encrypted-filepart',
            Client.constructFilepartFilename(
                rec.sha256,
                rec.part
            )
        );
    };

    function generateFinalFilename(rec: RemotePendingCommitDownloadedRecord) {
        return join(rootDir, rec.path);
    }


    function doUtimes(rec: RemotePendingCommitDownloadedRecord, next) {

        function convert(d: Date) { return Math.floor(d.getTime() / 1000); }
        let mtime = convert(rec.modifiedDate),
            atime = convert(rec.modifiedDate);
        utimes(generateFinalFilename(rec), atime, mtime, (e) => {
            next(e, rec);
        });
    }

    function doDecrypt(rec: RemotePendingCommitDownloadedRecord, next) {

        let recs = map(part0 => {
            return assoc('part', [part0, rec.part[1]], rec);
        }, range(1, rec.part[1] + 1));

        decrypt(
            gpgKey,
            map(generateOriginalEncryptedFilename, recs),
            generateDecryptedFilename(rec),
            (e) => { next(e, rec); }
        );
    }

    function doRename(rec: RemotePendingCommitDownloadedRecord, next) {
        rename(generateDecryptedFilename(rec), generateFinalFilename(rec), (e) => {
            next(e, rec);
        });
    }

    function doMkdir(rec: RemotePendingCommitDownloadedRecord, next) {
        mkdirp(dirname(join(rootDir, rec.path)), e => {
            next(e, rec);
        });
    }

    function doUnlinkOne(rec: RemotePendingCommitDownloadedRecord, next) {
        myUnlink(unlink, generateOriginalEncryptedFilename(rec), (e) => {
            next(e, rec);
        });
    }

    function doUnlink(rec: RemotePendingCommitDownloadedRecord, next) {

        let recs = map(part0 => {
            return assoc('part', [part0, rec.part[1]], rec);
        }, range(1, rec.part[1] + 1));

        mapLimit(recs, 10, doUnlinkOne, (e) => {
            next(e, rec);
        });
    }

    function process(rec: RemotePendingCommitDownloadedRecord, next: Callback<RemotePendingCommitDownloadedRecord>) {
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
        waterfall(tasks, next);
    }

    function finalize(a: RemotePendingCommitDownloaded, next) {
        let oldFilename = join(
            configDir,
            'remote-pending-commit',
            a.commitId + '-' + a.clientId + '.commit'
        );
        let newFilename = join(
            configDir,
            'remote-commit',
            a.commitId + '-' + a.clientId + '.commit'
        );
        mkdirp(dirname(newFilename), (e) => {
            if (e) { return next(e); }
            rename(oldFilename, newFilename, (e) => {
                next(e, a);
            });
        });
    }

    return function(a: RemotePendingCommitDownloaded, next: Callback<RemotePendingCommitDownloaded>) {
        mapLimit(a.record, 3, process, (e, r) => {
            if (e) { return next(e); }
            finalize(a, next);
        });
    };
}
