import { Callback, Filename, S3BucketName } from './Types';
import { Readable } from 'stronger-typed-streams'
import { S3 } from 'aws-sdk';

export abstract class EasyReadable<T> extends Readable<T> {

    private readCount = 0;
    private buffer: (null|T)[] = [];
    private ended = false;
    private waiting = false;

    constructor(opts = {}) {
        super(opts);
    }

    push(t: T|null, encoding?: string): boolean {
        this.readCount = this.readCount - 1;
        return super.push(t);
    }

    abstract __read(count: number, next: Callback<(null|T)[]>);

    private processBuffer() {
        while ((this.readCount > 0) && (this.buffer.length)) {
            this.push(<T>this.buffer.shift());
        }
    }

    private doRead() {
        if (this.ended || this.waiting) {
            return;
        }
        this.waiting = true;
        this.processBuffer();
        if (this.readCount > 0) {
            this.__read(this.readCount, (e, ts) => {
                this.waiting = false;
                if (e) { return this.emit('error', e); }
                if (ts) {
                    ts.forEach(t => {
                        if (t === null) {
                            this.ended = true;
                            this.buffer.push(t);
                        }
                        if (!this.ended) { this.buffer.push(t); }
                    });
                }
                this.processBuffer();
                if (this.readCount > 0) {
                    process.nextTick(() => { this.doRead(); });
                }
            });
        }
    }


    _read(count) {
        this.readCount = this.readCount + count;
        this.doRead();
    }
}


export default class S3CommitList extends EasyReadable<Filename> {

    private nextMarker: string|false = false;

    constructor(private s3: S3, private s3BucketName: S3BucketName, opts = {}) {
        super(Object.assign({objectMode: true}, opts));
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

