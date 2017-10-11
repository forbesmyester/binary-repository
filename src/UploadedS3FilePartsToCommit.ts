import { BASE_TLID_UNIQUENESS, BASE_TLID_TIMESTAMP, BackupRecord, Commit, ClientId, CommitId, Operation, Sha256, ByteCount, RelativeFilePath, FilePartIndex, UploadedS3FilePart } from './Types';
import { Transform } from 'streamdash';
import { path, reduce } from 'ramda';
import * as getTlidEncoderDecoder from 'get_tlid_encoder_decoder';

let tLIdEncoderDecoder = getTlidEncoderDecoder(
    BASE_TLID_TIMESTAMP,
    BASE_TLID_UNIQUENESS
);

export interface Dependencies {
    getDate: () => Date;
    interval: (f: Function) => Function;
    commitIdGenerator: (d: Date) => string;
}

export class UploadedS3FilePartsToCommit extends Transform<UploadedS3FilePart, Commit> {

    private records: BackupRecord[] = [];
    private emptyTime: Date;
    private getDate: () => Date;
    private commitIdGenerator: (d: Date) => string;
    private cancelTimer: Function;
    private interval;

    constructor(
        { getDate, interval, commitIdGenerator }: Dependencies,
        private clientId: string,
        private fileByteCountThreshold: number,
        private maxDelay: number,
        opts
    ) {
        super(Object.assign({objectMode: true, highWaterMark: 1}, opts));
        this.getDate = getDate;
        this.commitIdGenerator = commitIdGenerator;
        this.emptyTime = this.getDate();
        this.interval = interval;
    }

    static getDependencies() {
        return {
            getDate: () => { return new Date(); },
            interval: (f) => {
                let t = setInterval(f, 100);
                return function() {
                    clearInterval(t);
                };
            },
            commitIdGenerator: (d: Date) => {
                return tLIdEncoderDecoder.encode(d.getTime());
            }
        };
    }

    _transform(input: UploadedS3FilePart, encoding, cb) {

        if (input.uploadAlreadyExists) {
            return cb();
        }

        if (!this.cancelTimer) {
            this.cancelTimer = this.interval(() => {
                let t = this.getDate();
                if ((t.getTime() - this.maxDelay) > this.emptyTime.getTime()) {
                    this.empty(() => {});
                }
            });
        }

        let exitStatus = path(['result', 'exitStatus'], input);
        if (exitStatus !== 0) {
            // TODO: Replace with proper error.
            return cb(new Error(`Non zero exit status when uploading (${exitStatus})`));
        }
        this.records.push({
            sha256: input.sha256,
            operation: Operation.Create,
            fileByteCount: input.fileByteCount,
            modifiedDate: input.modifiedDate,
            path: input.path,
            part: input.part
        });
        let filesBytesCount = reduce(
            ((acc, {fileByteCount}) => acc + fileByteCount),
            0,
            this.records
        );
        if (filesBytesCount > this.fileByteCountThreshold) {
            return this.empty(cb);
        }
        cb();
    }

    empty(cb) {
        if (this.records.length == 0) { return cb(); }
        let d = this.getDate();
        this.push({
            clientId: this.clientId,
            createdAt: d,
            commitId: this.commitIdGenerator(d),
            record: this.records
        });
        this.records = [];
        this.emptyTime = this.getDate();
        cb();
    }

    _flush(cb) {
        this.empty(cb);
        if (this.cancelTimer) {
            this.cancelTimer();
        }
    }

}
