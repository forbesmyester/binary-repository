"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stronger_typed_streams_1 = require("stronger-typed-streams");
class S3CommitList extends stronger_typed_streams_1.Readable {
    constructor(s3, s3BucketName, opts = {}) {
        super(Object.assign({ objectMode: true }, opts));
        this.s3 = s3;
        this.s3BucketName = s3BucketName;
        this.nextMarker = false;
        this.ended = false;
        this.waiting = false;
    }
    doRead() {
        this.__read(16, (e, ts) => {
            if (e) {
                this.ended = true;
                return this.emit('error', e);
            }
            if (ts) {
                ts.forEach(t => {
                    if (t === null) {
                        this.ended = true;
                        this.push(t);
                    }
                    if (!this.ended) {
                        this.push(t);
                    }
                });
            }
            if (!this.ended) {
                process.nextTick(() => {
                    this.doRead();
                });
            }
        });
    }
    _read(count) {
        if (this.waiting) {
            return;
        }
        this.waiting = true;
        this.doRead();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWl0RmlsZW5hbWVTMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db21taXRGaWxlbmFtZVMzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUVBQWlEO0FBSWpELGtCQUFrQyxTQUFRLGlDQUFrQjtJQU94RCxZQUFvQixFQUFNLEVBQVUsWUFBMEIsRUFBRSxJQUFJLEdBQUcsRUFBRTtRQUNyRSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRC9CLE9BQUUsR0FBRixFQUFFLENBQUk7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUx0RCxlQUFVLEdBQWlCLEtBQUssQ0FBQztRQUNqQyxVQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2QsWUFBTyxHQUFHLEtBQUssQ0FBQztJQUt4QixDQUFDO0lBRU8sTUFBTTtRQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFO1lBQ3RCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDTCxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNYLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO3dCQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQixDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFBQyxDQUFDO2dCQUN0QyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNkLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO29CQUNsQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdELEtBQUssQ0FBQyxLQUFLO1FBQ1AsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUM7UUFBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsR0FBRyxDQUFDLENBQWM7UUFDZCxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNkLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBVSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFpQztRQUMzQyxJQUFJLE1BQU0sR0FBZ0M7WUFDdEMsTUFBTSxFQUFFLElBQUk7WUFDWixTQUFTLEVBQUUsS0FBSztZQUNoQixNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVk7U0FDNUIsQ0FBQztRQUNGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNoQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUM1QixDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQzFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEIsQ0FBQztZQUNELElBQUksTUFBTSxHQUFzQixJQUFJLENBQUMsR0FBRyxDQUFjLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6RSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQzFDLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLENBQUM7WUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBdkVELCtCQXVFQyJ9