import { Callback, Filename, S3BucketName } from './Types';
import { Readable } from 'stronger-typed-streams'
import { S3 } from 'aws-sdk';

abstract class EasyReadable<T> {
}


export default class S3CommitList extends Readable<Filename> {

    private nextMarker: string|false = false;
    private ended = false;
    private waiting = false;
    private count = 0;


    constructor(private s3: S3, private s3BucketName: S3BucketName, opts = {}) {
        super(Object.assign({objectMode: true}, opts));
    }

    private doRead() {
        this.__read(16, (e, ts) => {
            if (e) {
                this.ended = true;
                return this.emit('error', e);
            }
            if (ts) {
                ts.forEach(t => {
                    if (t === null) {
                        this.ended = true;
                        this.push(t);
                    }
                    if (!this.ended) { this.count++; this.push(t); }
                });
            }
            if (!this.ended) {
                process.nextTick(() => {
                    this.doRead();
                });
            }
        });
    }


    _read(count) {
        if (this.waiting) { return; }
        this.waiting = true;
        this.doRead();
    }

    map(c: S3.Object[]): Filename[] {
        return c.map(cc => {
            return { path: <string>cc.Key };
        });
    }

    __read(count, next: Callback<(Filename|null)[]>) {
        let params: S3.Types.ListObjectsRequest = {
            Prefix: 'c-',
            Delimiter: 'aaa',
            Bucket: this.s3BucketName
        };
        if (this.nextMarker) {
            params.Marker = this.nextMarker;
            this.nextMarker = false;
        }
        this.s3.listObjects(params, (err, metaData) => {
            if (err) {
                next(err, [null]);
            }
            let toPush: (Filename|null)[] = this.map(<S3.Object[]>metaData.Contents);
            if (metaData.NextMarker) {
                this.nextMarker = metaData.NextMarker;
            }
            if (!metaData.IsTruncated) {
                toPush.push(null);
            }
            next(null, toPush);
        });
    }
}

