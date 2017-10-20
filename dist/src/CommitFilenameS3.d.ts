import { Callback, Filename, S3BucketName } from './Types';
import { Readable } from 'stronger-typed-streams';
import { S3 } from 'aws-sdk';
export declare abstract class EasyReadable<T> extends Readable<T> {
    private readCount;
    private buffer;
    private ended;
    private waiting;
    constructor(opts?: {});
    push(t: T | null, encoding?: string): boolean;
    abstract __read(count: number, next: Callback<(null | T)[]>): any;
    private processBuffer();
    private doRead();
    _read(count: any): void;
}
export default class S3CommitList extends EasyReadable<Filename> {
    private s3;
    private s3BucketName;
    private nextMarker;
    constructor(s3: S3, s3BucketName: S3BucketName, opts?: {});
    map(c: S3.Object[]): Filename[];
    __read(count: any, next: Callback<(Filename | null)[]>): void;
}
