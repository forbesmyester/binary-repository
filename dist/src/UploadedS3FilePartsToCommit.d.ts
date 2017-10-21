import { Commit, GpgKey, UploadedS3FilePart } from './Types';
import { Transform } from 'streamdash';
export interface Dependencies {
    getDate: () => Date;
    interval: (f: Function) => Function;
    commitIdGenerator: (d: Date) => string;
}
export declare class UploadedS3FilePartsToCommit extends Transform<UploadedS3FilePart, Commit> {
    private clientId;
    private gpgKey;
    private fileByteCountThreshold;
    private maxDelay;
    private records;
    private emptyTime;
    private getDate;
    private commitIdGenerator;
    private interval;
    constructor({getDate, interval, commitIdGenerator}: Dependencies, clientId: string, gpgKey: GpgKey, fileByteCountThreshold: number, maxDelay: number, opts: any);
    static getDependencies(): {
        getDate: () => Date;
        interval: (f: any) => () => void;
        commitIdGenerator: (d: Date) => string;
    };
    _transform(input: UploadedS3FilePart, encoding: any, cb: any): any;
    empty(cb: any): any;
    _flush(cb: any): void;
}
