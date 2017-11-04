"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const CmdRunner_1 = require("./CmdRunner");
const fs_1 = require("fs");
const streamdash_1 = require("streamdash");
const mkdirp = require("mkdirp");
function getEnv(gpgKey, s3Bucket, configDir, a) {
    return {
        OPT_DD_BS: 1,
        OPT_DD_SKIP: 0,
        OPT_IS_LAST: 1,
        OPT_S3_OBJECT: a.path,
        OPT_DD_FILENAME: path_1.join(configDir, 'pending-commit', a.path),
        OPT_GPG_KEY: gpgKey,
        OPT_S3_BUCKET: s3Bucket
    };
}
function getDependencies() {
    return { rename: fs_1.rename, mkdirp, cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({}) };
}
exports.getDependencies = getDependencies;
function myRename(mkdirp, rename, s, d, n) {
    mkdirp(path_1.dirname(d), (e) => {
        if (e) {
            return n(e);
        }
        rename(s, d, (e) => {
            n(e);
        });
    });
}
function getCommittedToUploadedCommittedMapFunc({ rename, cmdSpawner }, configDir, s3Bucket, gpgKey, cmd
    // TODO: Pass in CmdSpawner
) {
    return function (a, cb) {
        let cmdRunner = new CmdRunner_1.CmdRunner({ cmdSpawner }, Object.assign({}, process.env, getEnv(gpgKey, s3Bucket, configDir, a)), ".", cmd, [], {});
        let sdc = streamdash_1.streamDataCollector(cmdRunner)
            .then((lines) => {
            myRename(mkdirp, rename, path_1.join(configDir, 'pending-commit', a.path), path_1.join(configDir, 'commit', a.path), e => { cb(e, a); });
        })
            .catch((err) => {
            cb(err); // TODO: What do we need to do here to make sure that
            // errors are readable by an end user?
        });
    };
}
exports.default = getCommittedToUploadedCommittedMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tbWl0dGVkVG9VcGxvYWRlZENvbW1pdHRlZE1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0Q29tbWl0dGVkVG9VcGxvYWRlZENvbW1pdHRlZE1hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQkFBcUM7QUFDckMsMkNBQTJFO0FBQzNFLDJCQUE0QjtBQUM1QiwyQ0FBcUU7QUFHckUsaUNBQWlDO0FBb0JqQyxnQkFBZ0IsTUFBYyxFQUFFLFFBQXNCLEVBQUUsU0FBZ0MsRUFBRyxDQUFpQjtJQUV4RyxNQUFNLENBQUM7UUFDSCxTQUFTLEVBQUUsQ0FBQztRQUNaLFdBQVcsRUFBRSxDQUFDO1FBQ2QsV0FBVyxFQUFFLENBQUM7UUFDZCxhQUFhLEVBQUUsQ0FBQyxDQUFDLElBQUk7UUFDckIsZUFBZSxFQUFFLFdBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMxRCxXQUFXLEVBQUUsTUFBTTtRQUNuQixhQUFhLEVBQUUsUUFBUTtLQUMxQixDQUFDO0FBRU4sQ0FBQztBQVNEO0lBQ0ksTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFOLFdBQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLHFCQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdkUsQ0FBQztBQUZELDBDQUVDO0FBRUQsa0JBQWtCLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFpQjtJQUNyRCxNQUFNLENBQUMsY0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDdkIsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxnREFDSSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQWdCLEVBQ3BDLFNBQWdDLEVBQ2hDLFFBQXNCLEVBQ3RCLE1BQWMsRUFDZCxHQUFnQjtJQUNoQiwyQkFBMkI7O0lBRzNCLE1BQU0sQ0FBQyxVQUFTLENBQWlCLEVBQUUsRUFBRTtRQUVqQyxJQUFJLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQ3pCLEVBQUUsVUFBVSxFQUFFLEVBQ2QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDdEUsR0FBRyxFQUNILEdBQUcsRUFDSCxFQUFFLEVBQ0YsRUFBRSxDQUNMLENBQUM7UUFFRixJQUFJLEdBQUcsR0FBRyxnQ0FBbUIsQ0FBQyxTQUFTLENBQUM7YUFDbkMsSUFBSSxDQUFDLENBQUMsS0FBSztZQUNSLFFBQVEsQ0FDSixNQUFNLEVBQ04sTUFBTSxFQUNOLFdBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUN6QyxXQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ2pDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNyQixDQUFDO1FBQ04sQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLENBQUMsR0FBRztZQUNQLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLHFEQUFxRDtZQUNyRCxzQ0FBc0M7UUFDbkQsQ0FBQyxDQUFDLENBQUM7SUFFWCxDQUFDLENBQUM7QUFDTixDQUFDO0FBcENELHlEQW9DQyJ9