import test from 'ava';
import { RemotePendingCommitInfoRecord, Operation, BackupRecord, RemotePendingCommit, RemotePendingCommitInfo, BackupCheckDatabase } from '../src/Types';
import getToRemotePendingCommitInfoRightAfterLeftMapFunc from '../src/getToRemotePendingCommitInfoRightAfterLeftMapFunc';


test("Can initialize", (tst) => {

    let database: BackupCheckDatabase = {
        "my-projects/getTLIdEncoderDecoder.md": [{
            filePartByteCountThreshold: 1,
            gpgKey: 'a',
            part: [1, 1],
            commitId: 'a',
            modifiedDate : new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 1816,
            sha256: "def"
        }],
        "my-projects/stronger-typed-streams.md": [{
            filePartByteCountThreshold: 1,
            gpgKey: 'a',
            part: [1, 1],
            commitId: 'a',
            modifiedDate:  new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 3832,
            sha256: "8d2"
        }],
        "my-projects/t-fp-assoc.md": [{
            filePartByteCountThreshold: 1,
            gpgKey: 'a',
            part: [1, 1],
            commitId: 'a',
            modifiedDate:  new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 1247,
            sha256: "e42"
        }],
        "my-projects/t-fp-dissoc.md": [{
            filePartByteCountThreshold: 1,
            gpgKey: 'a',
            part: [1, 1],
            commitId: 'a',
            modifiedDate:  new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 821,
            sha256: "472"
        }],
        "my-projects/t-fp-merge.md": [{
            filePartByteCountThreshold: 1,
            gpgKey: 'a',
            part: [1, 1],
            commitId: 'a',
            modifiedDate:  new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 401,
            sha256: "806"
        }],
        "my-projects/t-fp-to-pairs.md": [{
            filePartByteCountThreshold: 1,
            gpgKey: 'a',
            part: [1, 1 ],
            commitId: 'a',
            modifiedDate:  new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 363,
            sha256: "a4f"
        }],
        "my-projects/t-fp-from-pairs.md": [{
            filePartByteCountThreshold: 1,
            gpgKey: 'a',
            part: [1, 1],
            commitId: 'a',
            modifiedDate:  new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 359,
            sha256: "3ea"
        }]
    };

    let remotePending: BackupRecord[] = [
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '8d2', operation: Operation.Create, fileByteCount: 3832, modifiedDate: new Date('2016-06-24T10:46:12.432Z'), path: 'my-projects/stronger-typed-streams.md', part: [1, 1] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '200', operation: Operation.Create, fileByteCount: 200, modifiedDate: new Date('2016-09-09T17:27:22.730Z'), path: 'my-projects/t-fp-merge.md', part: [1, 1] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '444', operation: Operation.Create, fileByteCount: 444, modifiedDate: new Date('2019-09-09T17:27:22.730Z'), path: 'new-file.txt', part: [1, 1] },
        ],
        remoteCommit: RemotePendingCommit = {
            gpgKey: 'gg',
            clientId: 'notme',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'b',
            record: remotePending
        };

        let expectedRecord: RemotePendingCommitInfoRecord[] = [
            {
                gpgKey: 'g',
                sha256: '8d2',
                operation: Operation.Create,
                filePartByteCountThreshold: 1024,
                fileByteCount: 3832,
                modifiedDate: new Date('2016-06-24T10:46:12.432Z'),
                path: 'my-projects/stronger-typed-streams.md',
                part: [1, 1],
                local: {
                    modifiedDate:  new Date("2017-09-09T17:27:22.730Z"),
                    fileByteCount: 3832,
                    sha256: "8d2"
                }
            },
            {
                gpgKey: 'g',
                sha256: '200',
                operation: Operation.Create,
                filePartByteCountThreshold: 1024,
                fileByteCount: 200,
                modifiedDate: new Date('2016-09-09T17:27:22.730Z'),
                path: 'my-projects/t-fp-merge.md',
                part: [1, 1],
                local: {
                    modifiedDate:  new Date("2017-09-09T17:27:22.730Z"),
                    fileByteCount: 401,
                    sha256: "806"
                }
            },
            {
                gpgKey: 'g',
                sha256: '444',
                operation: Operation.Create,
                filePartByteCountThreshold: 1024,
                fileByteCount: 444,
                modifiedDate: new Date('2019-09-09T17:27:22.730Z'),
                path: 'new-file.txt',
                part: [1, 1],
                local: null
            },
        ];

        let expected: RemotePendingCommitInfo[] = [{
            gpgKey: 'gg',
            clientId: 'notme',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'b',
            record: expectedRecord
        }];

    let mfrl = getToRemotePendingCommitInfoRightAfterLeftMapFunc({});

    tst.deepEqual(mfrl([database], remoteCommit), expected);

});
