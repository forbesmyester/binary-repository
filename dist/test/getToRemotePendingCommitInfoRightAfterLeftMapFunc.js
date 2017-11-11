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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0SW5mb1JpZ2h0QWZ0ZXJMZWZ0TWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0SW5mb1JpZ2h0QWZ0ZXJMZWZ0TWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUN2Qix3Q0FBeUo7QUFDekosZ0lBQXlIO0FBR3pILGFBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBRTNCLElBQUksUUFBUSxHQUF3QjtRQUNoQyxzQ0FBc0MsRUFBRTtZQUNwQyxZQUFZLEVBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUM7WUFDbkQsYUFBYSxFQUFFLElBQUk7WUFDbkIsTUFBTSxFQUFFLEtBQUs7U0FDaEI7UUFDRCx1Q0FBdUMsRUFBRTtZQUNyQyxZQUFZLEVBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUM7WUFDbkQsYUFBYSxFQUFFLElBQUk7WUFDbkIsTUFBTSxFQUFFLEtBQUs7U0FDaEI7UUFDRCwyQkFBMkIsRUFBRTtZQUN6QixZQUFZLEVBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUM7WUFDbkQsYUFBYSxFQUFFLElBQUk7WUFDbkIsTUFBTSxFQUFFLEtBQUs7U0FDaEI7UUFDRCw0QkFBNEIsRUFBRTtZQUMxQixZQUFZLEVBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUM7WUFDbkQsYUFBYSxFQUFFLEdBQUc7WUFDbEIsTUFBTSxFQUFFLEtBQUs7U0FDaEI7UUFDRCwyQkFBMkIsRUFBRTtZQUN6QixZQUFZLEVBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUM7WUFDbkQsYUFBYSxFQUFFLEdBQUc7WUFDbEIsTUFBTSxFQUFFLEtBQUs7U0FDaEI7UUFDRCw4QkFBOEIsRUFBRTtZQUM1QixZQUFZLEVBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENB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