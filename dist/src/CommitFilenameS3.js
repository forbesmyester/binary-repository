"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stronger_typed_streams_1 = require("stronger-typed-streams");
class EasyReadable extends stronger_typed_streams_1.Readable {
    constructor(opts = {}) {
        super(opts);
        this.readCount = 0;
        this.buffer = [];
        this.ended = false;
        this.waiting = false;
    }
    push(t, encoding) {
        this.readCount = this.readCount - 1;
        return super.push(t);
    }
    processBuffer() {
        while ((this.readCount > 0) && (this.buffer.length)) {
            this.push(this.buffer.shift());
        }
    }
    doRead() {
        if (this.ended || this.waiting) {
            return;
        }
        this.waiting = true;
        this.processBuffer();
        if (this.readCount > 0) {
            this.__read(this.readCount, (e, ts) => {
                this.waiting = false;
                if (e) {
                    return this.emit('error', e);
                }
                if (ts) {
                    ts.forEach(t => {
                        if (t === null) {
                            this.ended = true;
                            this.buffer.push(t);
                        }
                        if (!this.ended) {
                            this.buffer.push(t);
                        }
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
exports.EasyReadable = EasyReadable;
class S3CommitList extends EasyReadable {
    constructor(s3, s3BucketName, opts = {}) {
        super(Object.assign({ objectMode: true }, opts));
        this.s3 = s3;
        this.s3BucketName = s3BucketName;
        this.nextMarker = false;
    }
    map(c) {
        return c.map(cc => {
            return { path: cc.Key };
        });
    }
    __read(count, next) {
        let params = {
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
            let toPush = this.map(metaData.Contents);
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
exports.default = S3CommitList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWl0RmlsZW5hbWVTMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db21taXRGaWxlbmFtZVMzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUVBQWlEO0FBR2pELGtCQUFzQyxTQUFRLGlDQUFXO0lBT3JELFlBQVksSUFBSSxHQUFHLEVBQUU7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBTlIsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUNkLFdBQU0sR0FBZSxFQUFFLENBQUM7UUFDeEIsVUFBSyxHQUFHLEtBQUssQ0FBQztRQUNkLFlBQU8sR0FBRyxLQUFLLENBQUM7SUFJeEIsQ0FBQztJQUVELElBQUksQ0FBQyxDQUFTLEVBQUUsUUFBaUI7UUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBSU8sYUFBYTtRQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN0QyxDQUFDO0lBQ0wsQ0FBQztJQUVPLE1BQU07UUFDVixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FB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