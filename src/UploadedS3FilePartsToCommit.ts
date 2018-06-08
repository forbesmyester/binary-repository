import { BackupRecord, Commit, GpgKey, Operation, UploadedS3FilePart } from './Types';
import { Transform } from 'streamdash';
import { reduce } from 'ramda';
import commitIdGenerator from './commitIdGenerator';

export interface Dependencies {
    getDate: () => Date;
    commitIdGenerator: (d: Date) => string;
}

export class UploadedS3FilePartsToCommit extends Transform<UploadedS3FilePart, Commit> {

    private records: BackupRecord[] = [];
    private emptyTime: Date;
    private getDate: () => Date;
    private commitIdGenerator: (d: Date) => string;

    constructor(
        { getDate, commitIdGenerator }: Dependencies,
        private clientId: string,
        private gpgKey: GpgKey, // For the Commit
        private fileByteCountThreshold: number,
        private maxDelay: number,
        opts
    ) {
        super(Object.assign({objectMode: true, highWaterMark: 1}, opts));
        this.getDate = getDate;
        this.commitIdGenerator = commitIdGenerator;
        this.emptyTime = this.getDate();
    }

    static getDependencies() {
        return {
            getDate: () => { return new Date(); },
            commitIdGenerator
        };
    }

    _transform(input: UploadedS3FilePart, encoding, cb) {

        this.records.push({
            gpgKey: input.gpgKey,
            sha256: input.sha256,
            operation: Operation.Create,
            fileByteCount: input.fileByteCount,
            modifiedDate: input.modifiedDate,
            path: input.path,
            filePartByteCountThreshold: input.filePartByteCountThreshold,
            part: input.part
        });
        let filesBytesCount = reduce(
            ((acc, {fileByteCount}) => acc + fileByteCount),
            0,
            this.records
        );

        if (
            (filesBytesCount > this.fileByteCountThreshold) ||
            ((this.getDate().getTime() - this.maxDelay) > this.emptyTime.getTime())
        ) {
            return this.empty(cb);
        }


        cb();
    }

    empty(cb) {
        if (this.records.length == 0) { return cb(); }
        let d = this.getDate();
        this.push({
            gpgKey: this.gpgKey,
            clientId: this.clientId,
            createdAt: d,
            commitId: this.commitIdGenerator(d),
            record: this.records
        });
        this.records = [];
        this.emptyTime = d;
        cb();
    }

    _flush(cb) {
        this.empty(cb);
    }

}
