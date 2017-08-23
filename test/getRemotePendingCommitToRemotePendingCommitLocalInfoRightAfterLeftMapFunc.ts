import test from 'ava';
import { assoc, reduce } from 'ramda';
import { Operation, CommitId, ClientId, BackupRecord, Commit, RemotePendingCommit } from '../src/Types';
import getRemotePendingCommitToRemotePendingCommitLocalInfoRightAfterLeftMapFunc from '../src/getRemotePendingCommitToRemotePendingCommitLocalInfoRightAfterLeftMapFunc';
import { PendingReceived, recordPendingsReceivedReduceFunc } from '../src/getRemotePendingCommitToRemotePendingCommitLocalInfoRightAfterLeftMapFunc';


test("Can check that we only have one pending (success)", (tst) => {

    let backupRecords: BackupRecord[] = [],
        commit: RemotePendingCommit = {
            clientId: 'fozz',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'rusdc000',
            record: backupRecords
        };

    tst.deepEqual(
        reduce(
            recordPendingsReceivedReduceFunc,
            [],
            [commit, commit, commit]
        ),
        [{ commitId: 'rusdc000', clientId: 'fozz' }]
    );

});

test("Can check that we only have one pending (commitId failure)", (tst) => {

    let backupRecords: BackupRecord[] = [],
        commit: RemotePendingCommit = {
            clientId: 'fozz',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'rusdc000',
            record: backupRecords
        };

    tst.throws(
        () => {
            reduce(
                recordPendingsReceivedReduceFunc,
                [],
                [commit, commit, assoc('commitId', 'xxx', commit)]
            );
        },
        /received more than one/
    );

});

test("Can check that we only have one pending (clientId failure)", (tst) => {

    let backupRecords: BackupRecord[] = [],
        commit: RemotePendingCommit = {
            clientId: 'fozz',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'rusdc000',
            record: backupRecords
        };

    tst.throws(
        () => {
            reduce(
                recordPendingsReceivedReduceFunc,
                [],
                [commit, commit, assoc('clientId', 'matt', commit)]
            );
        },
        /received more than one/
    );

});


test("Can initialize", (tst) => {

    let remoteBackupRecords: BackupRecord[] = [
            { sha256: 'ef2', operation: Operation.Create, fileByteCount: 58, modifiedDate: new Date('2016-06-24T10:46:12.432Z'), path: 'file-one', part: [1, 1] },
            { sha256: 'ef2', operation: Operation.Create, fileByteCount: 58, modifiedDate: new Date('2016-06-24T10:46:12.432Z'), path: 'file-two', part: [1, 1] },
        ],
        remoteCommit: RemotePendingCommit = {
            clientId: 'notme',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'b',
            record: remoteBackupRecords
        },
        localBackupRecords: BackupRecord[] = [
            { sha256: 'ab1', operation: Operation.Create, fileByteCount: 12, modifiedDate: new Date('2017-06-24T10:46:12.432Z'), path: 'local-file', part: [1, 1] },
            { sha256: 'ab1', operation: Operation.Create, fileByteCount: 12, modifiedDate: new Date('2014-06-24T10:46:12.432Z'), path: 'file-two', part: [1, 1] },
            { sha256: 'ef2', operation: Operation.Create, fileByteCount: 58, modifiedDate: new Date('2015-06-24T10:46:12.432Z'), path: 'file-two', part: [1, 1] },
            { sha256: 'ef2', operation: Operation.Create, fileByteCount: 58, modifiedDate: new Date('2012-06-24T10:46:12.432Z'), path: 'file-two', part: [1, 1] },
        ],
        localCommit: Commit = {
            clientId: 'me',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'a',
            record: localBackupRecords
        },
        f = getRemotePendingCommitToRemotePendingCommitLocalInfoRightAfterLeftMapFunc({});

    tst.deepEqual(
        f([remoteCommit], localCommit),
        [
            {
                'file-one': {
                    remoteModificationDate: new Date('2016-06-24T10:46:12.432Z'),
                    localCommit: null
                },
                'file-two': {
                    remoteModificationDate: new Date('2016-06-24T10:46:12.432Z'),
                    localCommit: {
                        commitId: 'a',
                        clientId: 'me',
                        modifiedDate: new Date('2015-06-24T10:46:12.432Z'),
                    }
                }
            }
        ]
    );

});
