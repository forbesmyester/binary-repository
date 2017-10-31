"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
function getToRemotePendingCommitInfoRightAfterLeftMapFunc(dependencies) {
    return function (dbs, rpc) {
        if (dbs.length === 0) {
            dbs = [{}];
        }
        if (dbs.length !== 1) {
            throw new Error("Was expecting only one BackupCheckDatabase");
        }
        let db = dbs[0];
        let record = ramda_1.map((record) => {
            if (!db.hasOwnProperty(record.path)) {
                return ramda_1.assoc('local', null, record);
            }
            return ramda_1.assoc('local', db[record.path], record);
        }, rpc.record);
        return [ramda_1.assoc('record', record, rpc)];
    };
}
exports.default = getToRemotePendingCommitInfoRightAfterLeftMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0SW5mb1JpZ2h0QWZ0ZXJMZWZ0TWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nZXRUb1JlbW90ZVBlbmRpbmdDb21taXRJbmZvUmlnaHRBZnRlckxlZnRNYXBGdW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQW1DO0FBTW5DLDJEQUEwRSxZQUEwQjtJQUVoRyxNQUFNLENBQUMsVUFBUyxHQUFHLEVBQUUsR0FBRztRQUVwQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhCLElBQUksTUFBTSxHQUFHLFdBQUcsQ0FDWixDQUFDLE1BQU0sRUFBaUMsRUFBRTtZQUN0QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxDQUFDLGFBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3hDLENBQUM7WUFDRCxNQUFNLENBQUMsYUFBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25ELENBQUMsRUFDRCxHQUFHLENBQUMsTUFBTSxDQUNiLENBQUM7UUFFRixNQUFNLENBQUMsQ0FBQyxhQUFLLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUMsQ0FBQztBQUVOLENBQUM7QUF4QkQsb0VBd0JDIn0=