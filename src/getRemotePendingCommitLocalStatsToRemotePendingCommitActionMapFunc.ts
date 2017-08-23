export interface Dependencies {}
import { MapFunc } from 'streamdash';
import { RemotePendingFileStats, RemotePendingCommitAction, RemotePendingCommitLocalStats } from './Types';
import { assoc, mapObjIndexed } from 'ramda';

export default function getRemotePendingCommitLocalStatsToRemotePendingCommitActionMapFunc(dependencies: Dependencies): MapFunc<RemotePendingCommitLocalStats, RemotePendingCommitAction> {

    return function remotePendingCommitLocalStatsToRemotePendingCommitActionMapFunc(stats, next) {

        let proceed = true;

        let files = mapObjIndexed(
            (file: RemotePendingFileStats, k) => {

                // OK if there is no local file
                if (file.localModificationDate === null) {
                    return assoc('proceed', true, file);
                }

                // OK if it was modified on the date at which it should have been
                if ((file.localCommit !== null) &&
                    (file.localModificationDate.getTime() == file.localCommit.modifiedDate.getTime())) {
                    return assoc('proceed', true, file);
                }

                proceed = false;
                return assoc('proceed', false, file);
            },
            stats
        );

        let result = assoc('proceed', proceed,
            assoc('files', files, {})
        );

        next(null, result);
    };
}
