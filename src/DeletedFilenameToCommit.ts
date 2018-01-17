import { Filename, BASE_TLID_UNIQUENESS, BASE_TLID_TIMESTAMP, BackupRecord, Commit, GpgKey, Operation, } from './Types';
import { map } from 'ramda';
import * as getTlidEncoderDecoder from 'get_tlid_encoder_decoder';
import Client from './Client';
import { Transform } from 'streamdash';

let tLIdEncoderDecoder = getTlidEncoderDecoder(
    BASE_TLID_TIMESTAMP,
    BASE_TLID_UNIQUENESS
);

export interface Dependencies {
    getDate: () => Date;
    commitIdGenerator: (d: Date) => string;
}

export default class DeletedFilenameToComitted extends Transform<Filename, Commit> {

    private filenames: Filename[] = [];
    private getDate: () => Date;
    private commitIdGenerator: (d: Date) => string;

    constructor(
        { getDate, commitIdGenerator }: Dependencies,
        private clientId: string,
        private gpgKey: GpgKey, // For the Commit
        private fileByteCountThreshold: number,
        opts
    ) {
        super(Object.assign({objectMode: true, highWaterMark: 1}, opts));
        this.getDate = getDate;
        this.commitIdGenerator = commitIdGenerator;
    }

    static getDependencies() {
        return {
            getDate: () => { return new Date(); },
            commitIdGenerator: (d: Date) => {
                return tLIdEncoderDecoder.encode(d.getTime());
            }
        };
    }

    _transform(input: Filename, encoding, cb) {
        this.filenames.push(input);
        cb();
    }


    mapper(d: Date, f: Filename): BackupRecord {
        return {
            gpgKey: this.gpgKey,
            sha256: Client.zeroShaSum,
            operation: Operation.Delete,
            fileByteCount: 0,
            modifiedDate: d,
            path: f.path,
            filePartByteCountThreshold: this.fileByteCountThreshold,
            part: [1, 1]
        };
    }

    _flush(cb) {
        if (this.filenames.length == 0) {
            return cb();
        }
        let d = this.getDate();
        this.push({
            gpgKey: this.gpgKey,
            clientId: this.clientId,
            createdAt: d,
            commitId: this.commitIdGenerator(d),
            record: map(this.mapper.bind(this, d), this.filenames)
        });
        cb();
    }

}
