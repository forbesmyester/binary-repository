"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const Types_1 = require("../src/Types");
const getToRemotePendingCommitInfoRightAfterLeftMapFunc_1 = require("../src/getToRemotePendingCommitInfoRightAfterLeftMapFunc");
ava_1.default("Can initialize", (tst) => {
    let database = {
        "my-projects/getTLIdEncoderDecoder.md": {
            modifiedDate: new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 1816,
            sha256: "def"
        },
        "my-projects/stronger-typed-streams.md": {
            modifiedDate: new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 3832,
            sha256: "8d2"
        },
        "my-projects/t-fp-assoc.md": {
            modifiedDate: new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 1247,
            sha256: "e42"
        },
        "my-projects/t-fp-dissoc.md": {
            modifiedDate: new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 821,
            sha256: "472"
        },
        "my-projects/t-fp-merge.md": {
            modifiedDate: new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 401,
            sha256: "806"
        },
        "my-projects/t-fp-to-pairs.md": {
            modifiedDate: new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 363,
            sha256: "a4f"
        },
        "my-projects/t-fp-from-pairs.md": {
            modifiedDate: new Date("2017-09-09T17:27:22.730Z"),
            fileByteCount: 359,
            sha256: "3ea"
        }
    };
    let remotePending = [
        { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '8d2', operation: Types_1.Operation.Create, fileByteCount: 3832, modifiedDate: new Date('2016-06-24T10:46:12.432Z'), path: 'my-projects/stronger-typed-streams.md', part: [1, 1] },
        { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '200', operation: Types_1.Operation.Create, fileByteCount: 200, modifiedDate: new Date('2016-09-09T17:27:22.730Z'), path: 'my-projects/t-fp-merge.md', part: [1, 1] },
        { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '444', operation: Types_1.Operation.Create, fileByteCount: 444, modifiedDate: new Date('2019-09-09T17:27:22.730Z'), path: 'new-file.txt', part: [1, 1] },
    ], remoteCommit = {
        gpgKey: 'gg',
        clientId: 'notme',
        createdAt: new Date('2017-07-22T17:02:48.966Z'),
        commitId: 'b',
        record: remotePending
    };
    let expectedRecord = [
        {
            gpgKey: 'g',
            sha256: '8d2',
            operation: Types_1.Operation.Create,
            filePartByteCountThreshold: 1024,
            fileByteCount: 3832,
            modifiedDate: new Date('2016-06-24T10:46:12.432Z'),
            path: 'my-projects/stronger-typed-streams.md',
            part: [1, 1],
            local: {
                modifiedDate: new Date("2017-09-09T17:27:22.730Z"),
                fileByteCount: 3832,
                sha256: "8d2"
            }
        },
        {
            gpgKey: 'g',
            sha256: '200',
            operation: Types_1.Operation.Create,
            filePartByteCountThreshold: 1024,
            fileByteCount: 200,
            modifiedDate: new Date('2016-09-09T17:27:22.730Z'),
            path: 'my-projects/t-fp-merge.md',
            part: [1, 1],
            local: {
                modifiedDate: new Date("2017-09-09T17:27:22.730Z"),
                fileByteCount: 401,
                sha256: "806"
            }
        },
        {
            gpgKey: 'g',
            sha256: '444',
            operation: Types_1.Operation.Create,
            filePartByteCountThreshold: 1024,
            fileByteCount: 444,
            modifiedDate: new Date('2019-09-09T17:27:22.730Z'),
            path: 'new-file.txt',
            part: [1, 1],
            local: null
        },
    ];
    let expected = [{
            gpgKey: 'gg',
            clientId: 'notme',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'b',
            record: expectedRecord
        }];
    let mfrl = getToRemotePendingCommitInfoRightAfterLeftMapFunc_1.default({});
    tst.deepEqual(mfrl([database], remoteCommit), expected);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0SW5mb1JpZ2h0QWZ0ZXJMZWZ0TWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0SW5mb1JpZ2h0QWZ0ZXJMZWZ0TWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUV2Qix3Q0FBcUw7QUFDckwsZ0lBQXlIO0FBR3pILGFBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUc7SUFFdkIsSUFBSSxRQUFRLEdBQXdCO1FBQ2hDLHNDQUFzQyxFQUFFO1lBQ3BDLFlBQVksRUFBRyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztZQUNuRCxhQUFhLEVBQUUsSUFBSTtZQUNuQixNQUFNLEVBQUUsS0FBSztTQUNoQjtRQUNELHVDQUF1QyxFQUFFO1lBQ3JDLFlBQVksRUFBRyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztZQUNuRCxhQUFhLEVBQUUsSUFBSTtZQUNuQixNQUFNLEVBQUUsS0FBSztTQUNoQjtRQUNELDJCQUEyQixFQUFFO1lBQ3pCLFlBQVksRUFBRyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztZQUNuRCxhQUFhLEVBQUUsSUFBSTtZQUNuQixNQUFNLEVBQUUsS0FBSztTQUNoQjtRQUNELDRCQUE0QixFQUFFO1lBQzFCLFlBQVksRUFBRyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztZQUNuRCxhQUFhLEVBQUUsR0FBRztZQUNsQixNQUFNLEVBQUUsS0FBSztTQUNoQjtRQUNELDJCQUEyQixFQUFFO1lBQ3pCLFlBQVksRUFBRyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztZQUNuRCxhQUFhLEVBQUUsR0FBRztZQUNsQixNQUFNLEVBQUUsS0FBSztTQUNoQjtRQUNELDhCQUE4QixFQUFFO1lBQzVCLFlBQVksRUFBRyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQztZQUNuRCxh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