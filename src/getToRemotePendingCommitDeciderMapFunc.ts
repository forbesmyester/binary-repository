import { RemotePendingCommitStatRecordDecided, RemotePendingCommitStatRecord, RelativeFilePath, UserErrorCode, UserError, RemotePendingCommitStat } from './Types';
import { MapFunc } from 'streamdash';
import { reduce, assoc, dissoc, filter, merge, map, concat } from 'ramda';

export interface Dependencies {}

export class DeciderUserError extends UserError {
    constructor(msg, code, public paths) {
        super(msg, code);
    }
}

interface Acc {
    blocker: RelativeFilePath[];
    proceed: RelativeFilePath[];
}

export interface RemotePendingCommitStatRecordDecidedX extends RemotePendingCommitStatRecordDecided {
    block: boolean;
    majorError?: null;
}


export default function getToRemotePendingCommitDeciderMapFunc(d: Dependencies): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat> {

    return function toRemotePendingCommitDeciderMapFunc(rpcs, next) {
        let work: RemotePendingCommitStatRecordDecidedX[] = map(
            (rec: RemotePendingCommitStatRecord) => {

                let proceed = !!(
                    (!rec.stat) ||
                    (!rec.local) ||
                    (rec.local.modifiedDate.getTime() < rec.modifiedDate.getTime())
                );

                // If there is no stat file, no damage can be done so copy over
                if (rec.stat === null) {
                    return merge(
                        rec,
                        { block: false, proceed }
                    );
                }

                // If there is stat, but it is not local (commit), stop.
                if (rec.local === null) {
                    return merge(
                        rec,
                        { block: true, proceed }
                    );
                }

                // If the stat is less thn the local commit then... filesystem/clock untrustworth?
                if (rec.stat.modifiedDate.getTime() < rec.local.modifiedDate.getTime()) {
                    let e = new DeciderUserError(
                        'Local file modified before commit ' + JSON.stringify(rec),
                        UserErrorCode.FILE_MODIFIED_BEFORE_LOCAL_COMMIT,
                        [rec.path]
                    );
                    return merge(
                        rec,
                        { block: true, proceed, majorError: e }
                    );
                }


                // If stat modifiedDate and size same then local (commit)
                if (
                    (rec.stat.modifiedDate.getTime() == rec.local.modifiedDate.getTime()) &&
                    (rec.stat.fileByteCount == rec.local.fileByteCount)
                ) {
                    return merge(
                        rec,
                        { block: false, proceed }
                    );
                }

                // If the stat is modified later the stat SHA must exist
                if (!rec.stat.hasOwnProperty('sha256')) {
                    let e = new DeciderUserError(
                        'Missing Sha256 ' + JSON.stringify(rec),
                        UserErrorCode.FILE_MODIFIED_AFTER_LOCAL_COMMIT_BUT_NO_SHA256,
                        [rec.path]
                    );
                    return merge(
                        rec,
                        { block: true, proceed, majorError: e }
                    );
                }

                // If stat is modified later, but Sha256 is different
                if (rec.local.sha256 !== rec.stat.sha256) {
                    return merge(
                        rec,
                        { block: true, proceed }
                    );
                }

                return merge(
                    rec,
                    { block: false, proceed }
                );
            },
            rpcs.record
        );

        let majorError: null|DeciderUserError = reduce(
            (acc, rec) => {
                return acc || rec.majorError || null;
            },
            <null|DeciderUserError>null,
            work
        );

        if (majorError) {
            return next(majorError);
        }

        let blocker = map(
            (rec) => rec.path,
            filter((rec) => rec.block, work)
        );

        if (blocker.length) {
            return next(new DeciderUserError(`Blocked by file ${blocker.join(', ')}`, UserErrorCode.BLOCKED_BY_FILE, blocker));
        }
        next(
            null,
            assoc(
                'record',
                map(dissoc('block'), work),
                rpcs
            )
        );
    };

}
