import test from 'ava';
import { assoc } from 'ramda';
import { AbsoluteFilePath, RemotePendingCommitLocalInfo, RemotePendingCommitLocalStats } from '../src/Types';
import getRemotePendingCommitLocalInfoToRemotePendingCommitLocalStatsMapFunc from '../src/getRemotePendingCommitLocalInfoToRemotePendingCommitLocalStatsMapFunc';

test.cb("Can initialize", (tst) => {

    let input: RemotePendingCommitLocalInfo = {
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
        },
        expected: RemotePendingCommitLocalStats = {
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
        };

    let fsStat = (path: AbsoluteFilePath, cb) => {
        if (path == '/ebak-root/file-one') {
            return cb({
                message: `Error: ENOENT: no such file or directory, stat '${path}'`,
                code: 'ENOENT'
            });
        }
        cb(null, { mtime: new Date('2015-06-24T10:46:12.432Z') });
    };

    let f = getRemotePendingCommitLocalInfoToRemotePendingCommitLocalStatsMapFunc(
        { fsStat },
        '/ebak-root'
    );

    f(input, (err, result) => {
        tst.is(err, null);
        tst.deepEqual(result, expected);
        tst.end();
    });

});
