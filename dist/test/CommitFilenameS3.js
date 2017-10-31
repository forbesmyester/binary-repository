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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWl0RmlsZW5hbWVTMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvQ29tbWl0RmlsZW5hbWVTMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUF1QjtBQUN2Qiw4REFBdUQ7QUFHdkQsMkNBQWlEO0FBRWpELGFBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBRWhDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLElBQUksRUFBRSxHQUFXO1FBQ2IsV0FBVyxDQUFDLE1BQW1DLEVBQUUsSUFBMkU7WUFDeEgsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDVixHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUNELEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1QixHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNQLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQztnQkFDbkIsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUM7Z0JBQzFFLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixPQUFPLEVBQUUsQ0FBQztnQkFDVixJQUFJLEVBQUUsZUFBZTthQUN4QixDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0osQ0FBQztJQUVGLElBQUksR0FBRyxHQUFHLElBQUksMEJBQWdCLENBQUMsRUFBRSxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFFekQsTUFBTSxDQUFDLGdDQUFtQixDQUFXLEdBQUcsQ0FBQztTQUNwQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNaLElBQUksUUFBUSxHQUFlO1lBQ3ZCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQzFCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQzFCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQzFCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1NBQzdCLENBQUM7UUFDRixHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDUCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixDQUFDLENBQUMsQ0FBQztBQUNYLENBQUMsQ0FBQyxDQUFDIn0=