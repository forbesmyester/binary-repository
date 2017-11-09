"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const Client_1 = require("../src/Client");
const getToDownloadedPartsMapFunc_1 = require("../src/getToDownloadedPartsMapFunc");
const Types_1 = require("../src/Types");
const RepositoryLocalfiles_1 = require("../src/repository/RepositoryLocalfiles");
function getInput(path, part, proceed = true) {
    let d = new Date('2017-07-22T17:02:48.966Z');
    return {
        gpgKey: 'gg',
        clientId: 'notme',
        createdAt: d,
        commitId: 'cid',
        record: [{
                gpgKey: 'my-gpg-key',
                filePartByteCountThreshold: 1024,
                sha256: 'sha',
                operation: Types_1.Operation.Create,
                fileByteCount: 200,
                modifiedDate: d,
                path: 'def.txt',
                part: part,
                local: null,
                stat: null,
                proceed
            }]
    };
}
function getStatResult(size) {
    return {
        isFile: () => true,
        isDirectory: () => true,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isSymbolicLink: () => false,
        isFIFO: () => false,
        isSocket: () => false,
        dev: -1,
        ino: -1,
        mode: -1,
        nlink: -1,
        uid: -1,
        gid: -1,
        rdev: -1,
        size: size,
        blksize: -1,
        blocks: -1,
        birthtimeMs: 0,
        atime: new Date(),
        atimeMs: 0,
        mtime: new Date(),
        mtimeMs: 0,
        ctime: new Date(),
        ctimeMs: 0,
        birthtime: new Date()
    };
}
ava_1.default.cb("Can do everything inc. download", (tst) => {
    let statDone = 0, downloadSizeDone = 0, downloadDone = 0;
    let deps = {
        stat: (f, next) => {
            tst.is(`/store/.ebak/remote-encrypted-filepart/f-sha-${++statDone}-1KB-my--gpg--key.ebak`, f);
            next(null, getStatResult(statDone * 100));
        },
        mkdirp: (dest, next) => {
            tst.true([
                "/store/.ebak/tmp",
                "/store/.ebak/remote-encrypted-filepart"
            ].indexOf(dest) > -1);
            next(null);
        },
        download: (t, f, d, next) => {
            tst.deepEqual(t, '/store/.ebak/tmp');
            tst.deepEqual(f, ['s3://mister-bucket', 'f-sha-1-1KB-my--gpg--key.ebak']);
            tst.deepEqual(d, '/store/.ebak/remote-encrypted-filepart/c-cid-f-sha-1-1KB-my--gpg--key.ebak');
            downloadDone = downloadDone + 1;
            next(null);
        },
        downloadSize: (loc, next) => {
            tst.deepEqual(loc, ['s3://mister-bucket', `f-sha-${++downloadSizeDone}-1KB-my--gpg--key.ebak`]);
            next(null, 200);
        },
        constructFilepartS3Location: RepositoryLocalfiles_1.default.constructFilepartS3Location,
        constructFilepartLocalLocation: Client_1.default.constructFilepartLocalLocation
    };
    let mapFunc = getToDownloadedPartsMapFunc_1.default(deps, '/store/.ebak', 's3://mister-bucket');
    let input = getInput('a/code.txt', [2, 2]);
    mapFunc(input, (err, result) => {
        tst.is(err, null);
        tst.is(2, statDone);
        tst.is(2, downloadSizeDone);
        tst.is(1, downloadDone);
        tst.is(null, err);
        tst.deepEqual(result, input);
        tst.end();
    });
});
ava_1.default.cb("Nothing is done when not proceed", (tst) => {
    let e = (f, next) => {
        throw new Error("Should not be here");
    };
    let deps = {
        mkdirp: e,
        stat: e,
        download: e,
        downloadSize: e,
        constructFilepartS3Location: e,
        constructFilepartLocalLocation: e
    };
    let mapFunc = getToDownloadedPartsMapFunc_1.default(deps, '/store/.ebak', 's3://mister-bucket');
    let input = getInput('a/file.txt', [1, 2], false);
    mapFunc(input, (err, result) => {
        tst.is(null, err);
        tst.deepEqual(result, input);
        tst.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9Eb3dubG9hZGVkUGFydHNNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9nZXRUb0Rvd25sb2FkZWRQYXJ0c01hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUI7QUFDdkIsMENBQW1DO0FBRW5DLG9GQUFzRTtBQUV0RSx3Q0FBeUc7QUFDekcsaUZBQTBFO0FBRTFFLGtCQUFrQixJQUFzQixFQUFFLElBQW1CLEVBQUUsVUFBbUIsSUFBSTtJQUNsRixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzdDLE1BQU0sQ0FBQztRQUNILE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFLE9BQU87UUFDakIsU0FBUyxFQUFFLENBQUM7UUFDWixRQUFRLEVBQUUsS0FBSztRQUNmLE1BQU0sRUFBRSxDQUFDO2dCQUNMLE1BQU0sRUFBRSxZQUFZO2dCQUNwQiwwQkFBMEIsRUFBRSxJQUFJO2dCQUNoQyxNQUFNLEVBQUUsS0FBSztnQkFDYixTQUFTLEVBQUUsaUJBQVMsQ0FBQyxNQUFNO2dCQUMzQixhQUFhLEVBQUUsR0FBRztnQkFDbEIsWUFBWSxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsT0FBTzthQUNWLENBQUM7S0FDTCxDQUFDO0FBRU4sQ0FBQztBQUVELHVCQUF1QixJQUFJO0lBQ3ZCLE1BQU0sQ0FBQztRQUNILE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ2xCLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJO1FBQ3ZCLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO1FBQzFCLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUs7UUFDOUIsY0FBYyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUs7UUFDM0IsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUs7UUFDbkIsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUs7UUFDckIsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNQLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDUCxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNULEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDUCxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1AsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNSLElBQUksRUFBRSxJQUFJO1FBQ1YsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNYLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDVixXQUFXLEVBQUUsQ0FBQztRQUNkLEtBQUssRUFBRSxJQUFJLElBQUksRUFBRTtRQUNqQixPQUFPLEVBQUUsQ0FBQztRQUNWLEtBQUssRUFBRSxJQUFJLElBQUksRUFBRTtRQUNqQixPQUFPLEVBQUUsQ0FBQztRQUNWLEtBQUssRUFBRSxJQUFJLElBQUksRUFBRTtRQUNqQixPQUFPLEVBQUUsQ0FBQztRQUNWLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtLQUN4QixDQUFDO0FBQ04sQ0FBQztBQUVELGFBQUksQ0FBQyxFQUFFLENBQUMsaUNBQWlDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUUvQyxJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQ1osZ0JBQWdCLEdBQUcsQ0FBQyxFQUNwQixZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBRXJCLElBQUksSUFBSSxHQUFpQjtRQUNyQixJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLGdEQUFnRCxFQUFFLFFBQVEsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUNELE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNuQixHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUNMLGtCQUFrQjtnQkFDbEIsd0NBQXdDO2FBQzNDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2YsQ0FBQztRQUNELFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3hCLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDckMsR0FBRyxDQUFDLFNBQVMsQ0FDVCxDQUFDLEVBQ0QsQ0FBQyxvQkFBb0IsRUFBRSwrQkFBK0IsQ0FBQyxDQUMxRCxDQUFDO1lBQ0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsNEVBQTRFLENBQUMsQ0FBQztZQUMvRixZQUFZLEdBQUcsWUFBWSxHQUFHLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDZixDQUFDO1FBQ0QsWUFBWSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3hCLEdBQUcsQ0FBQyxTQUFTLENBQ1QsR0FBRyxFQUNILENBQUMsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLGdCQUFnQix3QkFBd0IsQ0FBQyxDQUM5RSxDQUFDO1lBQ0YsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBQ0QsMkJBQTJCLEVBQUUsOEJBQW9CLENBQUMsMkJBQTJCO1FBQzdFLDhCQUE4QixFQUFFLGdCQUFNLENBQUMsOEJBQThCO0tBQ3hFLENBQUM7SUFFRixJQUFJLE9BQU8sR0FBRyxxQ0FBb0IsQ0FDOUIsSUFBSSxFQUNKLGNBQWMsRUFDZCxvQkFBb0IsQ0FDdkIsQ0FBQztJQUVGLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FDaEIsWUFBWSxFQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNULENBQUM7SUFFRixPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzNCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xCLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDNUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDeEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsQ0FBQztBQUlILGFBQUksQ0FBQyxFQUFFLENBQUMsa0NBQWtDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUVoRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDO0lBRUYsSUFBSSxJQUFJLEdBQWlCO1FBQ3JCLE1BQU0sRUFBRSxDQUFDO1FBQ1QsSUFBSSxFQUFFLENBQUM7UUFDUCxRQUFRLEVBQUUsQ0FBQztRQUNYLFlBQVksRUFBRSxDQUFDO1FBQ2YsMkJBQTJCLEVBQUUsQ0FBQztRQUM5Qiw4QkFBOEIsRUFBRSxDQUFDO0tBQ3BDLENBQUM7SUFFRixJQUFJLE9BQU8sR0FBRyxxQ0FBb0IsQ0FDOUIsSUFBSSxFQUNKLGNBQWMsRUFDZCxvQkFBb0IsQ0FDdkIsQ0FBQztJQUVGLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FDaEIsWUFBWSxFQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNOLEtBQUssQ0FDUixDQUFDO0lBRUYsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUMzQixHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsQixHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIn0=