"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const CommitFilenameS3_1 = require("../src/CommitFilenameS3");
const streamdash_1 = require("streamdash");
ava_1.default('Can list S3 Commits', (tst) => {
    let i = 0;
    let s3 = {
        listObjects(params, next) {
            if (i > 10) {
                return next(new Error("WTF"));
            }
            if (i !== 0) {
                tst.is(params.Marker, 'aaa');
            }
            tst.is(params.Prefix, 'c-');
            tst.is(params.Bucket, 's3://mister-bucket');
            next(null, {
                IsTruncated: i == 0,
                Contents: [{ Key: `c-sha-${i++}.commit` }, { Key: `c-sha-${i++}.commit` }],
                NextMarker: 'aaa',
                MaxKeys: 2,
                Name: "mister-bucket"
            });
        }
    };
    let s3r = new CommitFilenameS3_1.default(s3, 's3://mister-bucket');
    return streamdash_1.streamDataCollector(s3r)
        .then((parts) => {
        let expected = [
            { path: 'c-sha-0.commit' },
            { path: 'c-sha-1.commit' },
            { path: 'c-sha-2.commit' },
            { path: 'c-sha-3.commit' }
        ];
        tst.deepEqual(parts, expected);
    })
        .catch(e => {
        tst.fail(e.message);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWl0RmlsZW5hbWVTMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvQ29tbWl0RmlsZW5hbWVTMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUN2Qiw4REFBdUQ7QUFHdkQsMkNBQWlEO0FBRWpELGFBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEdBQUc7SUFFNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsSUFBSSxFQUFFLEdBQVc7UUFDYixXQUFXLENBQUMsTUFBbUMsRUFBRSxJQUEyRTtZQUN4SCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFBQyxDQUFDO1lBQzlDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVCLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1AsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDO2dCQUNuQixRQUFRLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQztnQkFDMUUsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLE9BQU8sRUFBRSxDQUFDO2dCQUNWLElBQUksRUFBRSxlQUFlO2FBQ3hCLENBQUMsQ0FBQztRQUNQLENBQUM7S0FDSixDQUFDO0lBRUYsSUFBSSxHQUFHLEdBQUcsSUFBSSwwQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUV6RCxNQUFNLENBQUMsZ0NBQW1CLENBQVcsR0FBRyxDQUFDO1NBQ3BDLElBQUksQ0FBQyxDQUFDLEtBQUs7UUFDUixJQUFJLFFBQVEsR0FBZTtZQUN2QixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUMxQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUMxQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUMxQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtTQUM3QixDQUFDO1FBQ0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLENBQUM7UUFDSixHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixDQUFDLENBQUMsQ0FBQztBQUNYLENBQUMsQ0FBQyxDQUFDIn0=