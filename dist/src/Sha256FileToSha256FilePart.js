"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const streamdash_1 = require("streamdash");
const ramda_1 = require("ramda");
class Sha256FileToSha256FilePart extends streamdash_1.Transform {
    constructor(rootPath, filePartByteCountThreshold, opts = {}) {
        super(Object.assign({ objectMode: true }, opts));
        this.rootPath = rootPath;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhMjU2RmlsZVRvU2hhMjU2RmlsZVBhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvU2hhMjU2RmlsZVRvU2hhMjU2RmlsZVBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQ0FBdUM7QUFHdkMsaUNBQWtFO0FBSWxFLGdDQUF3QyxTQUFRLHNCQUFxQztJQUVqRixZQUFvQixRQUErQixFQUFVLDBCQUFxQyxFQUFFLElBQUksR0FBRyxFQUFFO1FBQ3pHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFEL0IsYUFBUSxHQUFSLFFBQVEsQ0FBdUI7UUFBVSwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQVc7SUFFbEcsQ0FBQztJQUVELFVBQVUsQ0FBQyxDQUFhLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFFbEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSwwQkFBMEIsQ0FBUztZQUM1RSxNQUFNLENBQUMsYUFBSyxDQUFDLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSwwQkFBMEIsRUFBRSxDQUFDLENBQUM7UUFDbEYsQ0FBQyxDQUFDO1FBR0YsSUFBSSxDQUFDLEdBQUcsV0FBRyxDQUNQLE1BQU0sRUFDTiwwQkFBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FDckYsQ0FBQztRQUVGLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVoQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFYixDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFpQixFQUFFLDBCQUFxQztRQUN4RSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RFLElBQUksVUFBVSxHQUFHLGdCQUFRLENBQUMsV0FBRyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLEdBQUcsWUFBSSxDQUNSLGFBQUssQ0FBQyxDQUFDLENBQUMsRUFDUixVQUFVLENBQUMsQ0FBQyxDQUFTLEVBQUUsR0FBRztZQUN0QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRywwQkFBMEIsQ0FBQyxDQUFDO1lBQzdDLElBQUksTUFBTSxHQUFHLENBQUMsS0FBSyxHQUFHLDBCQUEwQixDQUFDLEdBQUcsTUFBTSxDQUFDO1lBQzNELE1BQU0sQ0FBQztnQkFDSCxLQUFLO2dCQUNMLE1BQU0sR0FBRywwQkFBMEIsR0FBRyxDQUFDLENBQUM7Z0JBQ3hDLENBQUMsTUFBTTtnQkFDUCxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDO2dCQUNoQiwwQkFBMEI7YUFDN0IsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUNMLENBQUM7UUFDRixNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BCLENBQUM7Q0FFSjtBQTVDRCxnRUE0Q0MifQ==