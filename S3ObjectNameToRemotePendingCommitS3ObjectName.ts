import { Filename, CommitFile, Commit, Committed, ClientId, CommitId } from './Types';
import { FilterFunc } from './stream';
import { RootReadable } from './RootReadable';

export interface AppliedRemoteCommit {
    clientId: ClientId;
    commitId: CommitId;
}

export interface S3Readable {
    // TODO: What...
}

/**
 * Figures out which remote Commit still needs to be ran.
 *
 * Assumptions:
 *
 *  * All of our commits are always merged (immediately)
 *  * Because TLId is time based then we only need to store the latest from
 *    ever client.
 *  * S3Readable gives a stream of S3Objectname which are the equivelant of our
 *    Commit
 */
export default class S3ObjectnameToRemotePendingCommitS3Objectname<S3Objectname, RemotePendingCommitS3Objectname> {

    fs: S3Objectname[];

    constructor(
        private myLatestCommit: CommitFile,
        private latestRemote: AppliedRemoteCommit[],
        allCommits: S3Readable
    ) {
    }

    _transform(f: S3Objectname, cb) {
        if (true /* Higher than the latestRemote value for the remote client */) {
            this.fs.push(f);
        }
        cb();
    }

    _flush(cb) {
        // TODO: sort based on TLId and push
        cb();
    }

}
