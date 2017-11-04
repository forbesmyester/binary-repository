"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stronger_typed_streams_1 = require("stronger-typed-streams");
class EasyReadable {
}
class S3CommitList extends stronger_typed_streams_1.Readable {
    constructor(s3, s3BucketName, opts = {}) {
        super(Object.assign({ objectMode: true }, opts));
        this.s3 = s3;
        this.s3BucketName = s3BucketName;
        this.nextMarker = false;
        this.ended = false;
        this.waiting = false;
        this.count = 0;
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
                        this.count++;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWl0RmlsZW5hbWVTMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db21taXRGaWxlbmFtZVMzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUVBQWlEO0FBR2pEO0NBQ0M7QUFHRCxrQkFBa0MsU0FBUSxpQ0FBa0I7SUFReEQsWUFBb0IsRUFBTSxFQUFVLFlBQTBCLEVBQUUsSUFBSSxHQUFHLEVBQUU7UUFDckUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBQyxVQUFVLEVBQUUsSUFBSSxFQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUQvQixPQUFFLEdBQUYsRUFBRSxDQUFJO1FBQVUsaUJBQVksR0FBWixZQUFZLENBQWM7UUFOdEQsZUFBVSxHQUFpQixLQUFLLENBQUM7UUFDakMsVUFBSyxHQUFHLEtBQUssQ0FBQztRQUNkLFlBQU8sR0FBRyxLQUFLLENBQUM7UUFDaEIsVUFBSyxHQUFHLENBQUMsQ0FBQztJQUtsQixDQUFDO0lBRU8sTUFBTTtRQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDbEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztnQkFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNMLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDUixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDYixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQzt3QkFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakIsQ0FBQztvQkFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUFDLENBQUM7Z0JBQ3BELENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2QsT0FBTyxDQUFDLFFBQVEsQ0FBQztvQkFDYixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdELEtBQUssQ0FBQyxLQUFLO1FBQ1AsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUM7UUFBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsR0FBRyxDQUFDLENBQWM7UUFDZCxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ1gsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFVLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxFQUFFLElBQWlDO1FBQzNDLElBQUksTUFBTSxHQUFnQztZQUN0QyxNQUFNLEVBQUUsSUFBSTtZQUNaLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWTtTQUM1QixDQUFDO1FBQ0YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDbEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQzVCLENBQUM7UUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsUUFBUTtZQUN0QyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLENBQUM7WUFDRCxJQUFJLE1BQU0sR0FBc0IsSUFBSSxDQUFDLEdBQUcsQ0FBYyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QixDQUFDO1lBQ0QsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXhFRCwrQkF3RUMifQ==