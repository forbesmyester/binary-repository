import { RemotePendingFileInfo, RemotePendingCommitLocalInfo, RelativeFilePath, CommitId, ClientId, BackupRecord, Commit, RemotePendingCommit } from './Types';
import { RightAfterLeftMapFunc } from 'streamdash';
import { assocPath, assoc, map, reduce, pick } from 'ramda';

export interface PendingReceived { commitId: CommitId; clientId: ClientId; }

class MoreThanOnePendingCommitError extends Error {}

export function recordPendingsReceivedReduceFunc(
    pendingCommitReceived: PendingReceived[],
    pendingCommit: RemotePendingCommit): PendingReceived[] {

    if (pendingCommitReceived.length == 0) {
        pendingCommitReceived.push(pick(['commitId', 'clientId'], pendingCommit));
    }

    if (
        (pendingCommitReceived[0].commitId != pendingCommit.commitId) ||
        (pendingCommitReceived[0].clientId != pendingCommit.clientId)) {
        throw new MoreThanOnePendingCommitError("We received more than " +
            "one pending commit, we should only process one at once " +
            JSON.stringify([pendingCommitReceived[0], pendingCommit]));
    }

    return pendingCommitReceived;
}

function getForPath(oldResult: RemotePendingCommitLocalInfo, d: RelativeFilePath): null|RemotePendingFileInfo {
    if (oldResult.exists.hasOwnProperty(d)) { return oldResult.exists[d]; }
    return null;
}

export default function(dependencies: {}): RightAfterLeftMapFunc<
    RemotePendingCommit, /* Only the first */
    Commit, /* All local and processed remote */
    RemotePendingCommitLocalInfo> /* Only if it will not overwrite not non commited local files> */ {

    let pendingsReceived: PendingReceived[] = [];
    let result: RemotePendingCommitLocalInfo;

    return function commitInformationForRemoteCommitRightAfterLeftMapFunc(
        pendingCommit: RemotePendingCommit[],
        commit: Commit
    ): RemotePendingCommitLocalInfo[]
    {

        // Only as validation
        pendingsReceived = reduce(
            recordPendingsReceivedReduceFunc,
            pendingsReceived,
            pendingCommit
        );

        let pending = pendingCommit[0];

        result = result ? result : reduce(
            (acc, record: BackupRecord) => {
                return assoc(
                    record.path,
                    { remoteModificationDate: record.modifiedDate, localCommit: null },
                    acc
                );
            },
            {},
            pending.record
        );

        result = reduce(
            (acc: RemotePendingCommitLocalInfo, record: BackupRecord) => {
                if (!acc.hasOwnProperty(record.path)) {
                    return acc;
                }

                let current = {
                    modifiedDate: record.modifiedDate,
                    clientId: commit.clientId,
                    commitId: commit.commitId
                };

                let local = acc[record.path].localCommit;

                if (local === null) {
                    return assocPath([record.path, 'localCommit'], current, acc);
                }

                if (local.modifiedDate.getTime() < record.modifiedDate.getTime()) {
                    return assocPath([record.path, 'localCommit'], current, acc);
                }

                return acc;
            },
            result,
            commit.record
        );

        return [result];

    };

}
