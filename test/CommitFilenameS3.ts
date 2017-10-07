import test from 'ava';
import CommitFilenameS3 from '../src/CommitFilenameS3';
import { Filename } from '../src/Types';
import { S3, AWSError, Request } from 'aws-sdk';
import { streamDataCollector } from 'streamdash';

test('Can list S3 Commits', (tst) => {

    let i = 0;
    let s3: S3 = <S3>{
        listObjects(params: S3.Types.ListObjectsRequest, next: (err: Error|AWSError|null, data?: S3.Types.ListObjectsOutput) => void) {
            if (i > 10) { return next(new Error("WTF")); }
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

    let s3r = new CommitFilenameS3(s3, 's3://mister-bucket');

    return streamDataCollector<Filename>(s3r)
        .then((parts) => {
            let expected: Filename[] = [
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
