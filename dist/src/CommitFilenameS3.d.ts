import { Callback, Filename, S3BucketName } from './Types';
import { Readable } from 'stronger-typed-streams';
import { S3 } from 'aws-sdk';
export default class S3CommitList extends Readable<Filename> {
    private s3;
    private s3BucketName;
    private nextMarker;
    private ended;
    private waiting;
    constructor(s3: S3, s3BucketName: S3BucketName, opts?: {});
    private doRead();
    _read(count: any): void;
    map(c: S3.Object[]): Filename[];
    __read(count: any, next: Callback<(Filename | null)[]>): void;
}
