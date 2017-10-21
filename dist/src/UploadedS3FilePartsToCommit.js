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
        if (input.uploadAlreadyExists) {
            return cb();
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkZWRTM0ZpbGVQYXJ0c1RvQ29tbWl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1VwbG9hZGVkUzNGaWxlUGFydHNUb0NvbW1pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUF5TTtBQUN6TSwyQ0FBdUM7QUFDdkMsaUNBQXFDO0FBQ3JDLGtFQUFrRTtBQUVsRSxJQUFJLGtCQUFrQixHQUFHLHFCQUFxQixDQUMxQywyQkFBbUIsRUFDbkIsNEJBQW9CLENBQ3ZCLENBQUM7QUFPRixpQ0FBeUMsU0FBUSxzQkFBcUM7SUFPbEYsWUFDSSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBZ0IsRUFDcEMsUUFBZ0IsRUFDaEIsTUFBYyxFQUFFLGlCQUFpQjtRQUNqQyxzQkFBOEIsRUFDOUIsUUFBZ0IsRUFDeEIsSUFBSTtRQUVKLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQU56RCxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQ2hCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQVE7UUFDOUIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQVZwQixZQUFPLEdBQW1CLEVBQUUsQ0FBQztRQWNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7UUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxlQUFlO1FBQ2xCLE1BQU0sQ0FBQztZQUNILE9BQU8sRUFBRSxRQUFRLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyQyxpQkFBaUIsRUFBRSxDQUFDLENBQU87Z0JBQ3ZCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDbEQsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQXlCLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFFOUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUVELElBQUksVUFBVSxHQUFHLFlBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2RCxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixtQ0FBbUM7WUFDbkMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztZQUNkLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07WUFDcEIsU0FBUyxFQUFFLGlCQUFTLENBQUMsTUFBTTtZQUMzQixhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWE7WUFDbEMsWUFBWSxFQUFFLEtBQUssQ0FBQyxZQUFZO1lBQ2hDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtZQUNoQiwwQkFBMEIsRUFBRSxLQUFLLENBQUMsMEJBQTBCO1lBQzVELElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxJQUFJLGVBQWUsR0FBRyxjQUFNLENBQ3hCLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBQyxhQUFhLEVBQUMsS0FBSyxHQUFHLEdBQUcsYUFBYSxDQUFDLEVBQy9DLENBQUMsRUFDRCxJQUFJLENBQUMsT0FBTyxDQUNmLENBQUM7UUFFRixFQUFFLENBQUMsQ0FDQyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7WUFDL0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FDMUUsQ0FBQyxDQUFDLENBQUM7WUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBR0QsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBRUQsS0FBSyxDQUFDLEVBQUU7UUFDSixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNOLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsU0FBUyxFQUFFLENBQUM7WUFDWixRQUFRLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUNuQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU87U0FDdkIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbkIsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQUU7UUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25CLENBQUM7Q0FFSjtBQXZGRCxrRUF1RkMifQ==