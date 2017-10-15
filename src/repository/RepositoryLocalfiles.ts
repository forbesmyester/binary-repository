import { GpgKey, AbsoluteFilePath, S3Location, S3BucketName, S3Object, RemotePendingCommitStatRecordDecided, Callback, AbsoluteDirectoryPath, ByteCount } from '../Types';
import { createReadStream, createWriteStream, rename, stat } from 'fs';
import RepositoryAbstract from './RepositoryAbstract';
import padLeadingZero from '../padLeadingZero';
import { join } from 'path';

function constructObject(gpgKey: GpgKey, a: RemotePendingCommitStatRecordDecided): S3Object {
    let p = padLeadingZero(("" + a.part[1]).length, a.part[0]);
    return `f-${a.sha256}-${p}.ebak`;
}
function copyFile(tmpDir: AbsoluteDirectoryPath, src: AbsoluteFilePath, dest: AbsoluteFilePath, next: Callback<void>) {
        let nexted = false;
        let tmpFile = join(tmpDir, dest.replace(/[^a-zA-Z0-9]/g, '_'));
        let read = createReadStream(src);
        let write = createWriteStream(tmpFile);
        read.on('error', (e) => { nexted ? null : next(e); nexted = true; });
        write.on('error', (e) => { nexted ? null : next(e); nexted = true; });
        write.on('close', (e) => {
            if (e) { return next(e); }
            if (nexted) { return; }
            rename(tmpFile, dest, next);
        });
        read.pipe(write);
}

let RepositoryLocalfiles: RepositoryAbstract = {

    constructFilepartS3Location: (s3Bucket: S3BucketName, gpgKey: GpgKey, rec: RemotePendingCommitStatRecordDecided): S3Location => {
        return [s3Bucket, constructObject(gpgKey, rec)];
    },

    exists: (loc: S3Location, next: Callback<boolean>) => {
        let absoluteFilepath: AbsoluteFilePath = join(loc[0], loc[1]);
        stat(absoluteFilepath, (e) => {
            if (e && (e.code == 'ENOENT')) {
                return next(null, false);
            }
            if (e) { return next(e); }
            next(null, true);
        });
    },

    downloadSize: (loc: S3Location, next: Callback<ByteCount>) => {
        let absoluteFilepath: AbsoluteFilePath = join(loc[0], loc[1]);
        stat(absoluteFilepath, (e, s) => {
            if (e) { return next(e); }
            next(null, s.size);
        });
    },

    download: (tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>) => {
        copyFile(tmpDir, join(loc[0], loc[1]), downloadTo, next);
    },

    upload: (tmpDir: AbsoluteDirectoryPath, src: AbsoluteFilePath, loc: S3Location, next: Callback<void>) => {
        let nexted = false;
        let tmp = join(tmpDir, src.replace(/[^a-zA-Z0-9]/, '_'));
        let read = createReadStream(src);
        let write = createWriteStream(tmp);
        read.on('error', (e) => { nexted ? null : next(e); nexted = true; });
        write.on('error', (e) => { nexted ? null : next(e); nexted = true; });
        write.on('close', (e) => {
            if (e) { return next(e); }
            if (nexted) { return; }
            rename(tmp, join(loc[0], loc[1]), next);
        });
        read.pipe(write);
    }

};

export default RepositoryLocalfiles;
