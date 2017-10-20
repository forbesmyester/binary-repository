"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const Types_1 = require("../src/Types");
const getLocalCommitFilenameToCommitMapFunc_1 = require("../src/getLocalCommitFilenameToCommitMapFunc");
const ramda_1 = require("ramda");
ava_1.default.cb("Can map", (tst) => {
    let data = [
        '["ef2",1,58,"1_1",1024,"2017-06-24T10:46:12.432Z","error_command","g"]',
        '["8cf",1,29,"2_3",1024,"2017-06-25T14:47:13.856Z","hello_command","g"]',
        '["def",1,1816,"1_1",1024,"2017-06-19T06:20:05.168Z","my-projects/getTLIdEncoderDecoder.md","g"]'
    ].join("\n");
    let commitDir = '/home/fozz/Projects/ebak/test', input = { commitType: 'data', path: '/c-rusdc000-gpg--key-fozz--client.commit' }, readFile = (filename, opts, cb) => {
        tst.is(filename, '/home/fozz/Projects/ebak/test/data/c-rusdc000-gpg--key-fozz--client.commit');
        tst.deepEqual(opts, { encoding: 'utf8' });
        cb(null, data);
    }, localCommitFileToCommitMapFunc = getLocalCommitFilenameToCommitMapFunc_1.default({ readFile }, commitDir);
    function serialize(commit) {
        let recordMapper = (record) => {
            return ramda_1.assoc('modifiedDate', ramda_1.path(['modifiedDate'], record).toISOString(), record);
        };
        let p = ramda_1.pipe(ramda_1.assoc('createdAt', ramda_1.path(['createdAt'], commit).toISOString()), (c) => {
            return ramda_1.assoc('record', ramda_1.map(recordMapper, ramda_1.path(['record'], c)), c);
        });
        return p(commit);
    }
    localCommitFileToCommitMapFunc(input, (err, c) => {
        let backupRecords = [
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'ef2', operation: Types_1.Operation.Create, fileByteCount: 58, modifiedDate: new Date('2017-06-24T10:46:12.432Z'), path: 'error_command', part: [1, 1] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '8cf', operation: Types_1.Operation.Create, fileByteCount: 29, modifiedDate: new Date('2017-06-25T14:47:13.856Z'), path: 'hello_command', part: [2, 3] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'def', operation: Types_1.Operation.Create, fileByteCount: 1816, modifiedDate: new Date('2017-06-19T06:20:05.168Z'), path: 'my-projects/getTLIdEncoderDecoder.md', part: [1, 1] }
        ], expected = {
            gpgKey: 'gpg-key',
            clientId: 'fozz-client',
            createdAt: new Date('2017-07-22T17:02:48.966Z'),
            commitId: 'rusdc000',
            record: backupRecords
        };
        tst.deepEqual(serialize(c), serialize(expected));
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0TG9jYWxDb21taXRGaWxlbmFtZVRvQ29tbWl0TWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvZ2V0TG9jYWxDb21taXRGaWxlbmFtZVRvQ29tbWl0TWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUV2Qix3Q0FBeUU7QUFDekUsd0dBQWlHO0FBQ2pHLGlDQUF5RDtBQUV6RCxhQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUc7SUFFbkIsSUFBSSxJQUFJLEdBQUc7UUFDUCx3RUFBd0U7UUFDeEUsd0VBQXdFO1FBQ3hFLGlHQUFpRztLQUNwRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUViLElBQUksU0FBUyxHQUFHLCtCQUErQixFQUMzQyxLQUFLLEdBQUcsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSwwQ0FBMEMsRUFBRSxFQUNoRixRQUFRLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDMUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsNEVBQTRFLENBQUMsQ0FBQztRQUMvRixHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkIsQ0FBQyxFQUNELDhCQUE4QixHQUFHLCtDQUFxQyxDQUNsRSxFQUFFLFFBQVEsRUFBRSxFQUNaLFNBQVMsQ0FDWixDQUFDO0lBRU4sbUJBQW1CLE1BQWM7UUFFN0IsSUFBSSxZQUFZLEdBQUcsQ0FBQyxNQUFNO1lBQ3RCLE1BQU0sQ0FBQyxhQUFLLENBQ1IsY0FBYyxFQUNQLFlBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxFQUFFLE1BQU0sQ0FBRSxDQUFDLFdBQVcsRUFBRSxFQUNwRCxNQUFNLENBQ1QsQ0FBQztRQUNOLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxHQUFHLFlBQUksQ0FDUixhQUFLLENBQUMsV0FBVyxFQUFTLFlBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sQ0FBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQ3JFLENBQUMsQ0FBQztZQUNFLE1BQU0sQ0FBQyxhQUFLLENBQ1IsUUFBUSxFQUNSLFdBQUcsQ0FBQyxZQUFZLEVBQUUsWUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDdEMsQ0FBQyxDQUNKLENBQUM7UUFDTixDQUFDLENBQ0osQ0FBQztRQUVGLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVELDhCQUE4QixDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFTO1FBQ2pELElBQUksYUFBYSxHQUFtQjtZQUM1QixFQUFFLDBCQUEwQixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLGlCQUFTLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDek0sRUFBRSwwQkFBMEIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxpQkFBUyxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ3pNLEVBQUUsMEJBQTBCLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsaUJBQVMsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsRUFBRSxJQUFJLEVBQUUsc0NBQXNDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO1NBQ3JPLEVBQ0QsUUFBUSxHQUFXO1lBQ2YsTUFBTSxFQUFFLFNBQVM7WUFDakIsUUFBUSxFQUFFLGFBQWE7WUFDdkIsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDO1lBQy9DLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLE1BQU0sRUFBRSxhQUFhO1NBQ3hCLENBQUM7UUFFTixHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNqRCxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=