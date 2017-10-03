import { RemotePendingCommitStatRecord, RemotePendingCommitStat, GpgKey, Callback, AbsoluteDirectoryPath, AbsoluteFilePath } from './Types';
import { MapFunc } from 'streamdash';
import { dirname, join } from 'path';
import * as mkdirp from 'mkdirp';
import { rename, unlink } from 'fs';
import { mapLimit, waterfall } from 'async';


export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}


export interface Dependencies {
    joinFiles: (srcs: AbsoluteFilePath[], dst: AbsoluteFilePath, next: Callback<void>) => void;
    // rename: (oldFn: AbsoluteFilePath, newFn: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
    unlink: (path: AbsoluteFilePath, next: Callback<void>) => void;
    decrypt: (gpgKey: GpgKey, src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>) => void;
}

export default function getToFile({joinFiles, mkdirp, unlink, decrypt}: Dependencies, gpgKey: GpgKey, configDir: AbsoluteDirectoryPath, rootDir: AbsoluteDirectoryPath): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat> {

    function doJoinFiles(rec: RemotePendingCommitStatRecord, next) {
        joinFiles(
            [generateDecryptedFilename(rec)],
            generateJoinedTmpFilename(rec),
            (e) => {
                next(e, rec);
            }
        );
    }

    function generateJoinedTmpFilename(rec: RemotePendingCommitStatRecord) {
        return join(configDir, 'tmp', rec.sha256 + '.ebak.dec');
    }


    function generateDecryptedFilename(rec: RemotePendingCommitStatRecord) {
        return join(configDir, 'tmp', rec.sha256 + '-' + rec.part[1] + '.ebak.dec');
    }

    function doDecrypt(rec: RemotePendingCommitStatRecord, next) {
        decrypt(
            gpgKey,
            join(configDir, 'remote-encrypted-filepart', rec.sha256 + '-' + rec.part[1] + '.ebak'),
            generateDecryptedFilename(rec),
            (e) => { next(e, rec); }
        );
    }

    function doMkdir(rec: RemotePendingCommitStatRecord, next) {
        mkdirp(dirname(join(rootDir, rec.path)), e => {
            next(e, rec);
        });
    }

    function process(rec: RemotePendingCommitStatRecord, next: Callback<RemotePendingCommitStatRecord>) {
        let tasks = [
            (next) => next(null, rec),
            doDecrypt,
            doJoinFiles,
            doMkdir
        ];
        waterfall(tasks, next);
    }

    return function(a: RemotePendingCommitStat, next: Callback<RemotePendingCommitStat>) {
        mapLimit(a.record, 3, process, (e, r) => {
            next(e, a);
        });
    };
}
