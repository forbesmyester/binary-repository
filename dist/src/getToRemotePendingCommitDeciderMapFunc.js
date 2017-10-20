"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const ramda_1 = require("ramda");
class DeciderUserError extends Types_1.UserError {
    constructor(msg, code, paths) {
        super(msg, code);
        this.paths = paths;
    }
}
exports.DeciderUserError = DeciderUserError;
function getToRemotePendingCommitDeciderMapFunc(d) {
    return function toRemotePendingCommitDeciderMapFunc(rpcs, next) {
        let work = ramda_1.map((rec) => {
            if (rec.part[0] != rec.part[1]) {
                return ramda_1.merge(rec, {
                    block: false,
                    proceed: false
                });
            }
            let proceed = !!((!rec.stat) ||
                (!rec.local) ||
                (rec.local.modifiedDate.getTime() < rec.modifiedDate.getTime()));
            // If there is no stat file, no damage can be done so copy over
            if (rec.stat === null) {
                return ramda_1.merge(rec, { block: false, proceed });
            }
            // If there is stat, but it is not local (commit), if different from repo.
            if (rec.local === null) {
                if (rec.sha256 == rec.stat.sha256) {
                    return ramda_1.merge(rec, { block: false, proceed: false });
                }
                return ramda_1.merge(rec, { block: true, proceed });
            }
            // If the stat is less thn the local commit then... filesystem/clock untrustworth?
            if (rec.stat.modifiedDate.getTime() < rec.local.modifiedDate.getTime()) {
                let e = new DeciderUserError('Local file modified before commit ' + JSON.stringify(rec), Types_1.UserErrorCode.FILE_MODIFIED_BEFORE_LOCAL_COMMIT, [rec.path]);
                return ramda_1.merge(rec, { block: true, proceed, majorError: e });
            }
            // If stat modifiedDate and size same then local (commit)
            if ((rec.stat.modifiedDate.getTime() == rec.local.modifiedDate.getTime()) &&
                (rec.stat.fileByteCount == rec.local.fileByteCount)) {
                return ramda_1.merge(rec, { block: false, proceed });
            }
            // If the stat is modified later the stat SHA must exist
            if (!rec.stat.hasOwnProperty('sha256')) {
                let e = new DeciderUserError('Missing Sha256 ' + JSON.stringify(rec), Types_1.UserErrorCode.FILE_MODIFIED_AFTER_LOCAL_COMMIT_BUT_NO_SHA256, [rec.path]);
                return ramda_1.merge(rec, { block: true, proceed, majorError: e });
            }
            // If stat is modified later, but Sha256 is different
            if (rec.local.sha256 !== rec.stat.sha256) {
                return ramda_1.merge(rec, { block: true, proceed });
            }
            return ramda_1.merge(rec, { block: false, proceed });
        }, rpcs.record);
        let majorError = ramda_1.reduce((acc, rec) => {
            return acc || rec.majorError || null;
        }, null, work);
        if (majorError) {
            return next(majorError);
        }
        let blocker = ramda_1.map((rec) => rec.path, ramda_1.filter((rec) => rec.block, work));
        if (blocker.length) {
            return next(new DeciderUserError(`Blocked by file ${blocker.join(', ')}`, Types_1.UserErrorCode.BLOCKED_BY_FILE, blocker));
        }
        next(null, ramda_1.assoc('record', ramda_1.map(ramda_1.dissoc('block'), work), rpcs));
    };
}
exports.default = getToRemotePendingCommitDeciderMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0RGVjaWRlck1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0RGVjaWRlck1hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBbUs7QUFFbkssaUNBQTBFO0FBSTFFLHNCQUE4QixTQUFRLGlCQUFTO0lBQzNDLFlBQVksR0FBRyxFQUFFLElBQUksRUFBUyxLQUFLO1FBQy9CLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFEUyxVQUFLLEdBQUwsS0FBSyxDQUFBO0lBRW5DLENBQUM7Q0FDSjtBQUpELDRDQUlDO0FBYUQsZ0RBQStELENBQWU7SUFFMUUsTUFBTSxDQUFDLDZDQUE2QyxJQUFJLEVBQUUsSUFBSTtRQUMxRCxJQUFJLElBQUksR0FBNEMsV0FBRyxDQUNuRCxDQUFDLEdBQWtDO1lBRS9CLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxhQUFLLENBQ1IsR0FBRyxFQUNIO29CQUNJLEtBQUssRUFBRSxLQUFLO29CQUNaLE9BQU8sRUFBRSxLQUFLO2lCQUNqQixDQUNKLENBQUM7WUFDTixDQUFDO1lBRUQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQ1osQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ1gsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQ1osQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQ2xFLENBQUM7WUFFRiwrREFBK0Q7WUFDL0QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFD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