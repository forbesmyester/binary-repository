import test from 'ava';
import { assoc } from 'ramda';
import { RemotePendingCommitAction, RemotePendingCommitLocalStats } from '../src/Types';
import getRemotePendingCommitLocalStatsToRemotePendingCommitActionMapFunc from '../src/getRemotePendingCommitLocalStatsToRemotePendingCommitActionMapFunc';

test.cb("Can initialize", (tst) => {

    let input: RemotePendingCommitLocalStats = {
            'file-one': {
                remoteModificationDate: new Date('2016-06-24T10:46:12.432Z'),
                localModificationDate: null,
                localCommit: null
            },
            'file-two': {
                remoteModificationDate: new Date('2016-06-24T10:46:12.432Z'),
                localModificationDate: new Date('2015-06-24T10:46:12.432Z'),
                localCommit: {
                    commitId: 'a',
                    clientId: 'me',
                    modifiedDate: new Date('2015-06-24T10:46:12.432Z'),
                }
            }
        },
        expected: RemotePendingCommitAction = {
            proceed: true,
            files: {
                'file-one': {
                    remoteModificationDate: new Date('2016-06-24T10:46:12.432Z'),
                    localModificationDate: null,
                    localCommit: null,
                    proceed: true
                },
                'file-two': {
                    remoteModificationDate: new Date('2016-06-24T10:46:12.432Z'),
                    localModificationDate: new Date('2015-06-24T10:46:12.432Z'),
                    localCommit: {
                        commitId: 'a',
                        clientId: 'me',
                        modifiedDate: new Date('2015-06-24T10:46:12.432Z'),
                    },
                    proceed: true
                }
            }
        };

    let f = getRemotePendingCommitLocalStatsToRemotePendingCommitActionMapFunc({});

    f(input, (err, result) => {
        tst.is(err, null);
        tst.deepEqual(result, expected);
        tst.end();
    });

});
