import { AbsoluteFilePath, S3Location, S3BucketName, S3Object, RemotePendingCommitStatRecordDecided, Callback, AbsoluteDirectoryPath, ByteCount } from '../Types';
import { createReadStream, createWriteStream, rename, stat } from 'fs';
import RepositoryAbstract from './RepositoryAbstract';
import padLeadingZero from '../padLeadingZero';
import { join } from 'path';
import { S3 } from 'aws-sdk';
import * as NodeStream from 'stream';


function constructObject(maxFilepart: number, a: RemotePendingCommitStatRecordDecided): S3Object {
    let p = padLeadingZero(("" + a.part[1]).length, a.part[0]);
    return `f-${a.sha256}-${p}.ebak`;
}

let s3 = new S3();

let RepositoryS3: RepositoryAbstract = {

    constructFilepartS3Location: (s3Bucket: S3BucketName, maxFilepart: number, rec: RemotePendingCommitStatRecordDecided): S3Location => {
        return [s3Bucket, constructObject(maxFilepart, rec)];
    },

    downloadSize: (loc: S3Location, next: Callback<ByteCount>) => {
        let params = { Bucket: loc[0], Prefix: loc[1] };
        s3.listObjects(params, (err, data) => {
            if (err) { return next(err); }
            if (!data.Contents || data.Contents.length == 0) {
                let o = JSON.stringify(loc);
                throw new Error(`Expected S3 Object ${o} did not exist`);
            }
            next(null, data.Contents[0].Size);
        });
        // let absoluteFilepath: AbsoluteFilePath = join(loc[0], loc[1]);
        // stat(absoluteFilepath, (e, s) => {
        //     if (e) { return next(e); }
        //     next(null, s.size);
        // });
    },

    download: (tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>) => {
        let params = { Bucket: loc[0], Key: loc[1] };
        s3.getObject(params, (err, metaData) => {
            if (err) { return next(err); }

            let nexted = false;
            let tmp = join(tmpDir, loc[1]);
            let write = createWriteStream(tmp);
            let read = new NodeStream.Duplex();
            read.push(metaData.Body);
            read.push(null);

            write.on('error', (e) => { nexted ? null : next(e); nexted = true; });
            write.on('close', (e) => {
                if (e) { return next(e); }
                if (nexted) { return; }
                rename(tmp, downloadTo, next);
            });
            read.pipe(write);
        });
        // let nexted = false;
        // let tmp = join(tmpDir, loc[1]);
        // let read = createReadStream(join(loc[0], loc[1]));
        // let write = createWriteStream(tmp);
        // read.on('error', (e) => { nexted ? null : next(e); nexted = true; });
        // write.on('error', (e) => { nexted ? null : next(e); nexted = true; });
        // write.on('close', (e) => {
        //     if (e) { return next(e); }
        //     if (nexted) { return; }
        //     rename(tmp, downloadTo, next);
        // });
        // read.pipe(write);
    }

};

export default RepositoryS3;

