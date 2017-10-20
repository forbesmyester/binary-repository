"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const streamdash_1 = require("streamdash");
const ramda_1 = require("ramda");
const getTlidEncoderDecoder = require("get_tlid_encoder_decoder");
let tLIdEncoderDecoder = getTlidEncoderDecoder(Types_1.BASE_TLID_TIMESTAMP, Types_1.BASE_TLID_UNIQUENESS);
class UploadedS3FilePartsToCommit extends streamdash_1.Transform {
    constructor({ getDate, interval, commitIdGenerator }, clientId, gpgKey, // For the Commit
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
        this.interval = interval;
    }
    static getDependencies() {
        return {
            getDate: () => { return new Date(); },
            interval: (f) => {
                let t = setInterval(f, 100);
                return function () {
                    clearInterval(t);
                };
            },
            commitIdGenerator: (d) => {
                return tLIdEncoderDecoder.encode(d.getTime());
            }
        };
    }
    _transform(input, encoding, cb) {
        if (input.uploadAlreadyExists) {
            return cb();
        }
        if (!this.cancelTimer) {
            this.cancelTimer = this.interval(() => {
                let t = this.getDate();
                if ((t.getTime() - this.maxDelay) > this.emptyTime.getTime()) {
                    this.empty(() => { });
                }
            });
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
        if (filesBytesCount > this.fileByteCountThreshold) {
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
exports.UploadedS3FilePartsToCommit = UploadedS3FilePartsToCommit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkZWRTM0ZpbGVQYXJ0c1RvQ29tbWl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1VwbG9hZGVkUzNGaWxlUGFydHNUb0NvbW1pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUF5TTtBQUN6TSwyQ0FBdUM7QUFDdkMsaUNBQXFDO0FBQ3JDLGtFQUFrRTtBQUVsRSxJQUFJLGtCQUFrQixHQUFHLHFCQUFxQixDQUMxQywyQkFBbUIsRUFDbkIsNEJBQW9CLENBQ3ZCLENBQUM7QUFRRixpQ0FBeUMsU0FBUSxzQkFBcUM7SUFTbEYsWUFDSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQWdCLEVBQzlDLFFBQWdCLEVBQ2hCLE1BQWMsRUFBRSxpQkFBaUI7UUFDakMsc0JBQThCLEVBQzlCLFFBQWdCLEVBQ3hCLElBQUk7UUFFSixLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFOekQsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUNoQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUFRO1FBQzlCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFacEIsWUFBTyxHQUFtQixFQUFFLENBQUM7UUFnQmpDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztRQUMzQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRUQsTUFBTSxDQUFDLGVBQWU7UUFDbEIsTUFBTSxDQUFDO1lBQ0gsT0FBTyxFQUFFLFFBQVEsTUFBTSxDQUFDLElBQUksSUFB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