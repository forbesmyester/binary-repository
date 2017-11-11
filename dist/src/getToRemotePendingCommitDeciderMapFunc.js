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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0RGVjaWRlck1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0RGVjaWRlck1hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBaUo7QUFFakosaUNBQWtFO0FBSWxFLHNCQUE4QixTQUFRLGlCQUFTO0lBQzNDLFlBQVksR0FBRyxFQUFFLElBQUksRUFBUyxLQUFLO1FBQy9CLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFEUyxVQUFLLEdBQUwsS0FBSyxDQUFBO0lBRW5DLENBQUM7Q0FDSjtBQUpELDRDQUlDO0FBUUQsZ0RBQStELENBQWU7SUFFMUUsTUFBTSxDQUFDLDZDQUE2QyxJQUFJLEVBQUUsSUFBSTtRQUMxRCxJQUFJLElBQUksR0FBNEMsV0FBRyxDQUNuRCxDQUFDLEdBQWtDLEVBQUUsRUFBRTtZQUVuQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixNQUFNLENBQUMsYUFBSyxDQUNSLEdBQUcsRUFDSDtvQkFDSSxLQUFLLEVBQUUsS0FBSztvQkFDWixPQUFPLEVBQUUsS0FBSztpQkFDakIsQ0FDSixDQUFDO1lBQ04sQ0FBQztZQUVELElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUNaLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUNYLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO2dCQUNaLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUNsRSxDQUFDO1lBRUYsK0RBQStEO1lBQy9ELEVBQUUsQ0FBQyxDQUFD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