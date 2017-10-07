import { AbsoluteFilePath, S3Location, S3BucketName, S3Object, RemotePendingCommitStatRecordDecided, Callback, AbsoluteDirectoryPath, ByteCount } from '../Types';
import { createReadStream, createWriteStream, rename, stat } from 'fs';
import RepositoryAbstract from './RepositoryAbstract';
import padLeadingZero from '../padLeadingZero';
import { join } from 'path';

function constructObject(maxFilepart: number, a: RemotePendingCommitStatRecordDecided): S3Object {
    let p = padLeadingZero(("" + a.part[1]).length, a.part[0]);
    return `f-${a.sha256}-${p}.ebak`;
}

let RepositoryLocalfiles: RepositoryAbstract = {

    constructFilepartS3Location: (s3Bucket: S3BucketName, maxFilepart: number, rec: RemotePendingCommitStatRecordDecided): S3Location => {
        return [s3Bucket, constructObject(maxFilepart, rec)];
    },

    downloadSize: (loc: S3Location, next: Callback<ByteCount>) => {
        let absoluteFilepath: AbsoluteFilePath = join(loc[0], loc[1]);
        stat(absoluteFilepath, (e, s) => {
            if (e) { return next(e); }
            next(null, s.size);
        });
    },

    download: (tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>) => {
        let nexted = false;
        let tmp = join(tmpDir, loc[1]);
        let read = createReadStream(join(loc[0], loc[1]));
        let write = createWriteStream(tmp);
        read.on('error', (e) => { nexted ? null : next(e); nexted = true; });
        write.on('error', (e) => { nexted ? null : next(e); nexted = true; });
        write.on('close', (e) => {
            if (e) { return next(e); }
            if (nexted) { return; }
            rename(tmp, downloadTo, next);
        });
        read.pipe(write);
    }

};

export default RepositoryLocalfiles;
