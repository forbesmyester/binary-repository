import { RemotePendingCommitStatRecord, RemotePendingCommitStat, GpgKey, Callback, AbsoluteDirectoryPath, AbsoluteFilePath } from './Types';
import { MapFunc } from 'streamdash';
import { dirname, join } from 'path';
import * as mkdirp from 'mkdirp';
import { rename, unlink } from 'fs';
import { parallelLimit, mapLimit, waterfall } from 'async';
import { assoc, map, range } from 'ramda';


export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}


export interface Dependencies {
    rename: (oldFn: AbsoluteFilePath, newFn: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
    unlink: (path: AbsoluteFilePath, next: Callback<void>) => void;
    decrypt: (gpgKey: GpgKey, src: AbsoluteFilePath[], dst: AbsoluteFilePath, next: Callback<void>) => void;
}

export default function getToFile({rename, mkdirp, unlink, decrypt}: Dependencies, gpgKey: GpgKey, configDir: AbsoluteDirectoryPath, rootDir: AbsoluteDirectoryPath): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat> {

    function generateDecryptedFilename(rec: RemotePendingCommitStatRecord) {
        return join(configDir, 'tmp', rec.sha256 + '.ebak.dec');
    }

    function generateOriginalEncryptedFilename(rec: RemotePendingCommitStatRecord) {
        return join(
            configDir,
            'remote-encrypted-filepart', rec.sha256 + '-' + rec.part[0] + '.ebak'
        );
    };

    function doDecrypt(rec: RemotePendingCommitStatRecord, next) {

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

    function doRename(rec: RemotePendingCommitStatRecord, next) {
        rename(generateDecryptedFilename(rec), join(rootDir, rec.path), (e) => {
            next(e, rec);
        });
    }

    function doMkdir(rec: RemotePendingCommitStatRecord, next) {
        mkdirp(dirname(join(rootDir, rec.path)), e => {
            next(e, rec);
        });
    }

    function doUnlinkOne(rec: RemotePendingCommitStatRecord, next) {
        unlink(generateOriginalEncryptedFilename(rec), (e) => {
            next(e, rec);
        });
    }

    function doUnlink(rec: RemotePendingCommitStatRecord, next) {

        let recs = map(part0 => {
            return assoc('part', [part0, rec.part[1]], rec);
        }, range(1, rec.part[1] + 1));

        mapLimit(recs, 10, doUnlinkOne, (e) => {
            next(e, rec);
        });
    }

    function process(rec: RemotePendingCommitStatRecord, next: Callback<RemotePendingCommitStatRecord>) {
        let tasks = [
            (next) => next(null, rec),
            doDecrypt,
            doMkdir,
            doRename,
            doUnlink
        ];
        waterfall(tasks, next);
    }

    return function(a: RemotePendingCommitStat, next: Callback<RemotePendingCommitStat>) {
        mapLimit(a.record, 3, process, (e, r) => {
            next(e, a);
        });
    };
}
