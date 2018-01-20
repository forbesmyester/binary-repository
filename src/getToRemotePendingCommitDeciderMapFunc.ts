import { RemotePendingCommitStatRecordDecided, RemotePendingCommitStatRecord, UserErrorCode, UserError, RemotePendingCommitStat } from './Types';
import { MapFunc } from 'streamdash';
import { reduce, assoc, dissoc, filter, merge, map } from 'ramda';

export interface Dependencies {}

export class DeciderUserError extends UserError {
    constructor(msg, code, public paths) {
        super(msg, code);
    }
}

export interface RemotePendingCommitStatRecordDecidedX extends RemotePendingCommitStatRecordDecided {
    block: boolean;
    majorError?: null;
}


export default function getToRemotePendingCommitDeciderMapFunc(d: Dependencies): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat> {

    return function toRemotePendingCommitDeciderMapFunc(rpcs, next) {
        let work: RemotePendingCommitStatRecordDecidedX[] = map(
            (rec: RemotePendingCommitStatRecord) => {

                // If we don't have the first part, don't do anything
                if (rec.part[0] != rec.part[1]) {
                    return merge(
                        rec,
                        {
                            block: false,
                            proceed: false
                        }
                    );
                }

                // Proceed:
                //   Without a file in the filesystem
                //   Without a local commit
                //   If the local commit is older than then the one in the backup
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

                // If there is no local commit then
                //   > skip processing if the file contents are the same as what
                //     we will write anyway
                //   > else block
                if (rec.local === null) {
                    if (rec.sha256 == rec.stat.sha256) {
                        return merge(
                            rec,
                            { block: false, proceed: false }
                        );
                    }
                    return merge(
                        rec,
                        { block: true, proceed }
                    );
                }

                // If the stat is less than the local commit then... filesystem/clock untrustworth?
                if (rec.stat.modifiedDate.getTime() < rec.local.modifiedDate.getTime()) {
                    let e = new DeciderUserError(
                        'Local file modified before local commit ' + JSON.stringify(rec),
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

                // If it is locally modified since the local commit and the file
                // sizes dont match a SHA would not have been generated but we
                // must block
                if (
                    (rec.stat.modifiedDate.getTime() > rec.local.modifiedDate.getTime()) &&
                    (rec.stat.fileByteCount != rec.local.fileByteCount)
                ) {
                    return merge(rec, { block: true, proceed });
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
