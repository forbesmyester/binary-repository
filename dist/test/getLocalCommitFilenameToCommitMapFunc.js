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
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'ef2', operation: Types_1.Operation.Create, fileByteCount: 58, modifiedDate: new Date('2017-06-24T10:46:12.000Z'), path: 'error_command', part: [1, 1] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: '8cf', operation: Types_1.Operation.Create, fileByteCount: 29, modifiedDate: new Date('2017-06-25T14:47:13.000Z'), path: 'hello_command', part: [2, 3] },
            { filePartByteCountThreshold: 1024, gpgKey: 'g', sha256: 'def', operation: Types_1.Operation.Create, fileByteCount: 1816, modifiedDate: new Date('2017-06-19T06:20:05.000Z'), path: 'my-projects/getTLIdEncoderDecoder.md', part: [1, 1] }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0TG9jYWxDb21taXRGaWxlbmFtZVRvQ29tbWl0TWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvZ2V0TG9jYWxDb21taXRGaWxlbmFtZVRvQ29tbWl0TWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUN2Qix3Q0FBK0Q7QUFDL0Qsd0dBQWlHO0FBQ2pHLGlDQUErQztBQUUvQyxhQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBRXZCLElBQUksSUFBSSxHQUFHO1FBQ1Asd0VBQXdFO1FBQ3hFLHdFQUF3RTtRQUN4RSxpR0FBaUc7S0FDcEcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFYixJQUFJLFNBQVMsR0FBRywrQkFBK0IsRUFDM0MsS0FBSyxHQUFHLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsMENBQTBDLEVBQUUsRUFDaEYsUUFBUSxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUM5QixHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSw0RUFBNEUsQ0FBQyxDQUFDO1FBQy9GLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuQixDQUFDLEVBQ0QsOEJBQThCLEdBQUcsK0NBQXFDLENBQ2xFLEVBQUUsUUFBUSxFQUFFLEVBQ1osU0FBUyxDQUNaLENBQUM7SUFFTixtQkFBbUIsTUFBYztRQUU3QixJQUFJLFlBQVksR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQzFCLE1BQU0sQ0FBQyxhQUFLLENBQ1IsY0FBYyxFQUNQLFlBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxFQUFFLE1BQU0sQ0FBRSxDQUFDLFdBQVcsRUFBRSxFQUNwRCxNQUFNLENBQ1QsQ0FBQztRQUNOLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxHQUFHLFlBQUksQ0FDUixhQUFLLENBQUMsV0FBVyxFQUFTLFlBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sQ0FBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQ3JFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDRixNQUFNLENBQUMsYUFBSyxDQUNSLFFBQVEsRUFDUixXQUFHLENBQUMsWUFBWSxFQUFFLFlBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ3RDLENBQUMsQ0FDSixDQUFDO1FBQ04sQ0FBQyxDQUNKLENBQUM7UUFFRixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCw4QkFBOEIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBUyxFQUFFLEVBQUU7UUFDckQsSUFBSSxhQUFhLEdBQW1CO1lBQzVCLEVBQUUsMEJBQTBCLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsaUJBQVMsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUN6TSxFQUFFLDBCQUEwQixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLGlCQUFTLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDek0sRUFBRSwwQkFBMEIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxpQkFBUyxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLElBQUksRUFBRSxzQ0FBc0MsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7U0FDck8sRUFDRCxRQUFRLEdBQVc7WUFDZixNQUFNLEVBQUUsU0FBUztZQUNqQixRQUFRLEVBQUUsYUFBYTtZQUN2QixTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUM7WUFDL0MsUUFBUSxFQUFFLFVBQVU7WUFDcEIsTUFBTSxFQUFFLGFBQWE7U0FDeEIsQ0FBQztRQUVOLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2pELEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==