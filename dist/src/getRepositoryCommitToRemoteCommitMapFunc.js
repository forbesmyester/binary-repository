"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CmdRunner_1 = require("./CmdRunner");
const streamdash_1 = require("streamdash");
const path_1 = require("path");
const fs_1 = require("fs");
const mkdirp = require("mkdirp");
function getDependencies() {
    return { rename: fs_1.rename, mkdirp, cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner({}) };
}
exports.getDependencies = getDependencies;
function getEnv(gpgKey, s3Bucket, s3Object, configDir) {
    return {
        OPT_S3_OBJECT: s3Object,
        OPT_IS_FIRST: 1,
        OPT_DESTINATION: path_1.join(configDir, 'tmp', s3Object),
        OPT_GPG_KEY: gpgKey,
        OPT_S3_BUCKET: s3Bucket
    };
}
function getRepositoryCommitToRemoteCommitMapFunc(dependencies, configDir, s3Bucket, gpgKey, cmd) {
    return function repositoryCommitToRemoteCommitMapFuncRealImpl(input, next) {
        let env = getEnv(gpgKey, s3Bucket, input.path, configDir);
        let cmdRunner = new CmdRunner_1.CmdRunner({ cmdSpawner: dependencies.cmdSpawner }, Object.assign({}, process.env, env), ".", cmd, [], {});
        let sdc = streamdash_1.streamDataCollector(cmdRunner)
            .then((lines) => {
            return {
                result: { exitStatus: 0, output: lines },
                commitType: 'remote-pending-commit',
                path: input.path
            };
        })
            .then((r) => {
            return new Promise((resolve, reject) => {
                mkdirp(path_1.join(configDir, 'remote-pending-commit'), (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(r);
                });
            });
        })
            .then((r) => {
            let dest = path_1.join(configDir, 'remote-pending-commit', input.path);
            dependencies.rename(env.OPT_DESTINATION, dest, (err) => {
                if (err) {
                    return next(err);
                }
                next(null, r);
            });
        })
            .catch((err) => { next(err); });
    };
}
exports.default = getRepositoryCommitToRemoteCommitMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UmVwb3NpdG9yeUNvbW1pdFRvUmVtb3RlQ29tbWl0TWFwRnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nZXRSZXBvc2l0b3J5Q29tbWl0VG9SZW1vdGVDb21taXRNYXBGdW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMkNBQW9EO0FBR3BELDJDQUFpRDtBQUNqRCwrQkFBNEI7QUFDNUIsMkJBQTRCO0FBQzVCLGlDQUFpQztBQWFqQztJQUNJLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBTixXQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3ZFLENBQUM7QUFGRCwwQ0FFQztBQWFELGdCQUFnQixNQUFjLEVBQUUsUUFBc0IsRUFBRSxRQUFrQixFQUFFLFNBQWdDO0lBRXhHLE1BQU0sQ0FBQztRQUNILGFBQWEsRUFBRSxRQUFRO1FBQ3ZCLFlBQVksRUFBRSxDQUFDO1FBQ2YsZUFBZSxFQUFFLFdBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQztRQUNqRCxXQUFXLEVBQUUsTUFBTTtRQUNuQixhQUFhLEVBQUUsUUFBUTtLQUMxQixDQUFDO0FBRU4sQ0FBQztBQUdELGtEQUNJLFlBQTBCLEVBQzFCLFNBQWdDLEVBQ2hDLFFBQXNCLEVBQ3RCLE1BQWMsRUFDZCxHQUFnQjtJQUdoQixNQUFNLENBQUMsdURBQ0gsS0FBZSxFQUNmLElBQXNEO1FBRXRELElBQUksR0FBRyxHQUFHLE1BQU0sQ0FDWixNQUFNLEVBQ04sUUFBUSxFQUNSLEtBQUssQ0FBQyxJQUFJLEVBQ1YsU0FBUyxDQUNaLENBQUM7UUFFRixJQUFJLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQ3pCLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUUsRUFDdkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQXlCLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQzFELEdBQUcsRUFDSCxHQUFHLEVBQ0gsRUFBRSxFQUNGLEVBQUUsQ0FDTCxDQUFDO1FBRUYsSUFBSSxHQUFHLEdBQUcsZ0NBQW1CLENBQUMsU0FBUyxDQUFDO2FBQ25DLElBQUksQ0FBQyxDQUFDLEtBQUs7WUFDUixNQUFNLENBQUM7Z0JBQ0gsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO2dCQUN4QyxVQUFVLEVBQUUsdUJBQXVCO2dCQUNuQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7YUFDbkIsQ0FBQztRQUNOLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtnQkFDL0IsTUFBTSxDQUFDLFdBQUksQ0FBQyxTQUFTLEVBQUUsdUJBQXVCLENBQUMsRUFBRSxDQUFDLEdBQUc7b0JBQ2pELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFBQyxDQUFDO29CQUNoQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxDQUFDLENBQStCO1lBQ2xDLElBQUksSUFBSSxHQUFHLFdBQUksQ0FBQyxTQUFTLEVBQUUsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hFLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHO2dCQUMvQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQzthQUNELEtBQUssQ0FBQyxDQUFDLEdBQUcsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUM7QUFFTixDQUFDO0FBdERELDJEQXNEQyJ9