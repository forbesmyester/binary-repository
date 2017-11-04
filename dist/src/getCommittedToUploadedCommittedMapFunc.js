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
        let env = getEnv(gpgKey, s3Bucket, configDir, a);
        let cmdRunner = new CmdRunner_1.CmdRunner({ cmdSpawner }, Object.assign({}, process.env, env), ".", cmd, [], {});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tbWl0dGVkVG9VcGxvYWRlZENvbW1pdHRlZE1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0Q29tbWl0dGVkVG9VcGxvYWRlZENvbW1pdHRlZE1hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQkFBcUM7QUFDckMsMkNBQTJFO0FBQzNFLDJCQUE0QjtBQUM1QiwyQ0FBcUU7QUFHckUsaUNBQWlDO0FBb0JqQyxnQkFBZ0IsTUFBYyxFQUFFLFFBQXNCLEVBQUUsU0FBZ0MsRUFBRyxDQUFpQjtJQUV4RyxNQUFNLENBQUM7UUFDSCxTQUFTLEVBQUUsQ0FBQztRQUNaLFdBQVcsRUFBRSxDQUFDO1FBQ2QsV0FBVyxFQUFFLENBQUM7UUFDZCxhQUFhLEVBQUUsQ0FBQyxDQUFDLElBQUk7UUFDckIsZUFBZSxFQUFFLFdBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMxRCxXQUFXLEVBQUUsTUFBTTtRQUNuQixhQUFhLEVBQUUsUUFBUTtLQUMxQixDQUFDO0FBRU4sQ0FBQztBQVNEO0lBQ0ksTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFOLFdBQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLHFCQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdkUsQ0FBQztBQUZELDBDQUVDO0FBRUQsa0JBQWtCLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFpQjtJQUNyRCxNQUFNLENBQUMsY0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDdkIsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxnREFDSSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQWdCLEVBQ3BDLFNBQWdDLEVBQ2hDLFFBQXNCLEVBQ3RCLE1BQWMsRUFDZCxHQUFnQjtJQUNoQiwyQkFBMkI7O0lBRzNCLE1BQU0sQ0FBQyxVQUFTLENBQWlCLEVBQUUsRUFBRTtRQUVqQyxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakQsSUFBSSxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUN6QixFQUFFLFVBQVUsRUFBRSxFQUNkLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUEwQixPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUMzRCxHQUFHLEVBQ0gsR0FBRyxFQUNILEVBQUUsRUFDRixFQUFFLENBQ0wsQ0FBQztRQUVGLElBQUksR0FBRyxHQUFHLGdDQUFtQixDQUFDLFNBQVMsQ0FBQzthQUNuQyxJQUFJLENBQUMsQ0FBQyxLQUFLO1lBQ1IsUUFBUSxDQUNKLE1BQU0sRUFDTixNQUFNLEVBQ04sV0FBSSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ3pDLFdBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDakMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3JCLENBQUM7UUFDTixDQUFDLENBQUM7YUFDRCxLQUFLLENBQUMsQ0FBQyxHQUFHO1lBQ1AsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMscURBQXFEO1lBQ3JELHNDQUFzQztRQUNuRCxDQUFDLENBQUMsQ0FBQztJQUVYLENBQUMsQ0FBQztBQUNOLENBQUM7QUFyQ0QseURBcUNDIn0=