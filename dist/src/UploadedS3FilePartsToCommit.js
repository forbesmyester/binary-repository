"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const streamdash_1 = require("streamdash");
const ramda_1 = require("ramda");
const getTlidEncoderDecoder = require("get_tlid_encoder_decoder");
let tLIdEncoderDecoder = getTlidEncoderDecoder(Types_1.BASE_TLID_TIMESTAMP, Types_1.BASE_TLID_UNIQUENESS);
class UploadedS3FilePartsToCommit extends streamdash_1.Transform {
    constructor({ getDate, commitIdGenerator }, clientId, gpgKey, // For the Commit
        fileByteCountThreshold, maxDelay, opts) {
        super(Object.assign({ objectMode: true, highWaterMark: 1 }, opts));
        this.clientId = clientId;
        this.gpgKey = gpgKey;
        this.fileByteCountThreshold = fileByteCountThreshold;
        this.maxDelay = maxDelay;
        this.records = [];
        this.getDate = getDate;
        this.commitIdGenerator = commitIdGenerator;
        this.emptyTime = this.getDate();
    }
    static getDependencies() {
        return {
            getDate: () => { return new Date(); },
            commitIdGenerator: (d) => {
                return tLIdEncoderDecoder.encode(d.getTime());
            }
        };
    }
    _transform(input, encoding, cb) {
        let exitStatus = ramda_1.path(['result', 'exitStatus'], input);
        if (exitStatus !== 0) {
            // TODO: Replace with proper error.
            return cb(new Error(`Non zero exit status when uploading (${exitStatus})`));
        }
        this.records.push({
            gpgKey: input.gpgKey,
            sha256: input.sha256,
            operation: Types_1.Operation.Create,
            fileByteCount: input.fileByteCount,
            modifiedDate: input.modifiedDate,
            path: input.path,
            filePartByteCountThreshold: input.filePartByteCountThreshold,
            part: input.part
        });
        let filesBytesCount = ramda_1.reduce(((acc, { fileByteCount }) => acc + fileByteCount), 0, this.records);
        if ((filesBytesCount > this.fileByteCountThreshold) ||
            ((this.getDate().getTime() - this.maxDelay) > this.emptyTime.getTime())) {
            return this.empty(cb);
        }
        cb();
    }
    empty(cb) {
        if (this.records.length == 0) {
            return cb();
        }
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
exports.UploadedS3FilePartsToCommit = UploadedS3FilePartsToCommit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkZWRTM0ZpbGVQYXJ0c1RvQ29tbWl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1VwbG9hZGVkUzNGaWxlUGFydHNUb0NvbW1pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUF5TTtBQUN6TSwyQ0FBdUM7QUFDdkMsaUNBQXFDO0FBQ3JDLGtFQUFrRTtBQUVsRSxJQUFJLGtCQUFrQixHQUFHLHFCQUFxQixDQUMxQywyQkFBbUIsRUFDbkIsNEJBQW9CLENBQ3ZCLENBQUM7QUFPRixpQ0FBeUMsU0FBUSxzQkFBcUM7SUFPbEYsWUFDSSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBZ0IsRUFDcEMsUUFBZ0IsRUFDaEIsTUFBYyxFQUFFLGlCQUFpQjtRQUNqQyxzQkFBOEIsRUFDOUIsUUFBZ0IsRUFDeEIsSUFBSTtRQUVKLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQU56RCxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQ2hCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQVE7UUFDOUIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQVZwQixZQUFPLEdBQW1CLEVBQUUsQ0FBQztRQWNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7UUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxlQUFlO1FBQ2xCLE1BQU0sQ0FBQztZQUNILE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckMsaUJBQWlCLEVB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