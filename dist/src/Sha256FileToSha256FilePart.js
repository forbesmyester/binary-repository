"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const streamdash_1 = require("streamdash");
const ramda_1 = require("ramda");
class Sha256FileToSha256FilePart extends streamdash_1.Transform {
    constructor(filePartByteCountThreshold, opts = {}) {
        super(Object.assign({ objectMode: true }, opts));
        this.filePartByteCountThreshold = filePartByteCountThreshold;
    }
    _transform(a, encoding, cb) {
        let mapper = ([offset, length, isLast, part, filePartByteCountThreshold]) => {
            return ramda_1.merge(a, { offset, length, isLast, part, filePartByteCountThreshold });
        };
        let r = ramda_1.map(mapper, Sha256FileToSha256FilePart.parts(a.fileByteCount, this.filePartByteCountThreshold));
        r.forEach(this.push.bind(this));
        cb(null);
    }
    static parts(length, filePartByteCountThreshold) {
        let steps = Math.floor((length - 1) / filePartByteCountThreshold) + 1;
        let mapIndexed = ramda_1.addIndex(ramda_1.map);
        let f = ramda_1.pipe(ramda_1.range(0), mapIndexed((n, ind) => {
            let start = (n * filePartByteCountThreshold);
            let isLast = (start + filePartByteCountThreshold) < length;
            return [
                start,
                isLast ? filePartByteCountThreshold : -1,
                !isLast,
                [ind + 1, steps],
                filePartByteCountThreshold
            ];
        }));
        return f(steps);
    }
}
exports.Sha256FileToSha256FilePart = Sha256FileToSha256FilePart;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhMjU2RmlsZVRvU2hhMjU2RmlsZVBhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvU2hhMjU2RmlsZVRvU2hhMjU2RmlsZVBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQ0FBdUM7QUFDdkMsaUNBQTBEO0FBSTFELGdDQUF3QyxTQUFRLHNCQUFxQztJQUVqRixZQUFvQiwwQkFBcUMsRUFBRSxJQUFJLEdBQUcsRUFBRTtRQUNoRSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRC9CLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBVztJQUV6RCxDQUFDO0lBRUQsVUFBVSxDQUFDLENBQWEsRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUVsQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLDBCQUEwQixDQUFTLEVBQWtCLEVBQUU7WUFDaEcsTUFBTSxDQUFDLGFBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDO1FBQ2xGLENBQUMsQ0FBQztRQUdGLElBQUksQ0FBQyxHQUFHLFdBQUcsQ0FDUCxNQUFNLEVBQ04sMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQ3JGLENBQUM7UUFFRixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFaEMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBaUIsRUFBRSwwQkFBcUM7UUFDeEUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0RSxJQUFJLFVBQVUsR0FBRyxnQkFBUSxDQUFDLFdBQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxHQUFHLFlBQUksQ0FDUixhQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ1IsVUFBVSxDQUFDLENBQUMsQ0FBUyxFQUFFLEdBQUcsRUFBVSxFQUFFO1lBQ2xDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLDBCQUEwQixDQUFDLENBQUM7WUFDN0MsSUFBSSxNQUFNLEdBQUcsQ0FBQyxLQUFLLEdBQUcsMEJBQTBCLENBQUMsR0FBRyxNQUFNLENBQUM7WUFDM0QsTUFBTSxDQUFDO2dCQUNILEtBQUs7Z0JBQ0wsTUFBTSxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxDQUFDLE1BQU07Z0JBQ1AsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQztnQkFDaEIsMEJBQTBCO2FBQzdCLENBQUM7UUFDTixDQUFDLENBQUMsQ0FDTCxDQUFDO1FBQ0YsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQixDQUFDO0NBRUo7QUE1Q0QsZ0VBNENDIn0=