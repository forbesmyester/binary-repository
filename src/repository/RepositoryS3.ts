import { GpgKey, AbsoluteFilePath, S3Location, S3BucketName, S3Object, RemotePendingCommitStatRecordDecided, Callback, AbsoluteDirectoryPath, ByteCount } from '../Types';
import { createReadStream, createWriteStream, rename } from 'fs';
import RepositoryAbstract from './RepositoryAbstract';
import { join } from 'path';
import { S3 } from 'aws-sdk';
import Client from '../Client';
import * as NodeStream from 'stream';


function constructObject(gpgKey: GpgKey, a: RemotePendingCommitStatRecordDecided): S3Object {
    return Client.constructFilepartFilename(
        a.sha256,
        a.part,
        a.filePartByteCountThreshold,
        gpgKey
    );
}

let s3 = new S3();

let RepositoryS3: RepositoryAbstract = {

    constructFilepartS3Location: (s3Bucket: S3BucketName, gpgKey: GpgKey, rec: RemotePendingCommitStatRecordDecided): S3Location => {
        return [s3Bucket, constructObject(gpgKey, rec)];
    },

    exists: (loc: S3Location, next: Callback<boolean>) => {
        let params = { Bucket: loc[0], Key: loc[1] };
        s3.headObject(params, (e, data) => {
            if (e) {
                if (e.code == 'NotFound') {
                    return next(null, false);
                }
                return next(e);
            }
            if (data && (<number>data.ContentLength > 0)) {
                return next(null, true);
            }
            next(null, false);
        });
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
    },

    upload: (tmpDir: AbsoluteDirectoryPath, src: AbsoluteFilePath, loc: S3Location, next: Callback<void>) => {
        s3.upload({ Bucket: loc[0], Key: loc[1], Body: createReadStream(src) }, (e) => {
            next(e);
        });
    }
};

export default RepositoryS3;

