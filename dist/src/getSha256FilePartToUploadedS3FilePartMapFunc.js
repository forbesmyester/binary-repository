"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const Client_1 = require("./Client");
const path_1 = require("path");
const CmdRunner_1 = require("./CmdRunner");
const streamdash_1 = require("streamdash");
const ramda_1 = require("ramda");
const RepositoryLocalfiles_1 = require("./repository/RepositoryLocalfiles");
const RepositoryS3_1 = require("./repository/RepositoryS3");
function getDependencies(rt) {
    let d = {
        cmdSpawner: CmdRunner_1.CmdRunner.getCmdSpawner(),
    };
    if (rt == Types_1.RemoteType.S3) {
        return ramda_1.assoc('exists', RepositoryS3_1.default.exists, d);
    }
    if (rt == Types_1.RemoteType.LOCAL_FILES) {
        return ramda_1.assoc('exists', RepositoryLocalfiles_1.default.exists, d);
    }
    throw new Error("Unsupported");
}
exports.getDependencies = getDependencies;
function getSha256FilePartToUploadedS3FilePartMapFunc({ cmdSpawner, exists }, rootPath, s3Bucket, gpgKey, filePartByteCountThreshold, cmd) {
    function getEnv(filePartByteCountThreshold, a) {
        return {
            OPT_DD_SKIP: a.offset,
            OPT_DD_BS: 1,
            OPT_DD_COUNT: a.length,
            OPT_DD_FILENAME: path_1.join(rootPath, a.path),
            OPT_IS_LAST: a.part[0] == a.part[1] ? 1 : 0,
            OPT_GPG_KEY: gpgKey,
            OPT_S3_BUCKET: s3Bucket,
            OPT_S3_OBJECT: Client_1.default.constructFilepartFilename(a.sha256, a.part, filePartByteCountThreshold, gpgKey)
        };
    }
    let ret = (a, cb) => {
        let expectedLoc = [
            s3Bucket,
            Client_1.default.constructFilepartFilename(a.sha256, a.part, filePartByteCountThreshold, gpgKey)
        ];
        exists(expectedLoc, (e, isThere) => {
            if (e) {
                return cb(e);
            }
            if (isThere) {
                return cb(null, ramda_1.merge({
                    result: { exitStatus: 0, output: [] },
                    uploadAlreadyExists: true,
                    gpgKey: gpgKey
                }, a));
            }
            let cmdRunner = new CmdRunner_1.CmdRunner({ cmdSpawner: cmdSpawner }, Object.assign({}, process.env, getEnv(filePartByteCountThreshold, a)), ".", cmd, [], {});
            let sdc = streamdash_1.streamDataCollector(cmdRunner)
                .then((lines) => {
                cb(null, ramda_1.merge({
                    gpgKey: gpgKey,
                    result: {
                        exitStatus: 0,
                        output: lines
                    },
                    uploadAlreadyExists: false
                }, a));
            })
                .catch((err) => {
                cb(err);
            });
        });
    };
    ret.getEnv = getEnv;
    return ret;
}
exports.default = getSha256FilePartToUploadedS3FilePartMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0U2hhMjU2RmlsZVBhcnRUb1VwbG9hZGVkUzNGaWxlUGFydE1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0U2hhMjU2RmlsZVBhcnRUb1VwbG9hZGVkUzNGaWxlUGFydE1hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBNE87QUFDNU8scUNBQThCO0FBRTlCLCtCQUE0QjtBQUM1QiwyQ0FBMkU7QUFDM0UsMkNBQWlEO0FBQ2pELGlDQUFxQztBQUVyQyw0RUFBcUU7QUFDckUsNERBQXFEO0FBZ0NyRCx5QkFBZ0MsRUFBYztJQUUxQyxJQUFJLENBQUMsR0FBRztRQUNKLFVBQVUsRUFBRSxxQkFBUyxDQUFDLGFBQWEsRUFBRTtLQUN4QyxDQUFDO0lBRUYsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLGtCQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsYUFBSyxDQUNSLFFBQVEsRUFDUixzQkFBWSxDQUFDLE1BQU0sRUFDbkIsQ0FBQyxDQUNKLENBQUM7SUFDTixDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLGtCQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUMvQixNQUFNLENBQUMsYUFBSyxDQUNSLFFBQVEsRUFDUiw4QkFBb0IsQ0FBQyxNQUFNLEVBQzNCLENBQUMsQ0FDSixDQUFDO0lBQ04sQ0FBQztJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQXZCRCwwQ0F1QkM7QUFFRCxzREFBcUUsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFlLEVBQUUsUUFBK0IsRUFBRSxRQUFzQixFQUFFLE1BQWMsRUFBRSwwQkFBa0MsRUFBRSxHQUFnQjtJQUVsTyxnQkFBZ0IsMEJBQWtDLEVBQUUsQ0FBaUI7UUFFakUsTUFBTSxDQUFDO1lBQ0gsV0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNO1lBQ3JCLFNBQVMsRUFBRSxDQUFDO1lBQ1osWUFBWSxFQUFFLENBQUMsQ0FBQyxNQUFNO1lBQ3RCLGVBQWUsRUFBRSxXQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDdkMsV0FBVyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNDLFdBQVcsRUFBRSxNQUFNO1lBQ25CLGFBQWEsRUFBRSxRQUFRO1lBQ3ZCLGFBQWEsRUFBRSxnQkFBTSxDQUFDLHlCQUF5QixDQUMzQyxDQUFDLENBQUMsTUFBTSxFQUNSLENBQUMsQ0FBQyxJQUFJLEVBQ04sMEJBQTBCLEVBQzFCLE1BQU0sQ0FDVDtTQUNKLENBQUM7SUFFTixDQUFDO0lBRUQsSUFBSSxHQUFHLEdBQXdHLENBQUMsQ0FBaUIsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUVySSxJQUFJLFdBQVcsR0FBZTtZQUMxQixRQUFRO1lBQ1IsZ0JBQU0sQ0FBQyx5QkFBeUIsQ0FDNUIsQ0FBQyxDQUFDLE1BQU0sRUFDUixDQUFDLENBQUMsSUFBSSxFQUNOLDBCQUEwQixFQUMxQixNQUFNLENBQ1Q7U0FDSixDQUFDO1FBRUYsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUMvQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxDQUFDO1lBRXhCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsTUFBTSxDQUFDLEVBQUUsQ0FDTCxJQUFJLEVBQ0osYUFBSyxDQUNEO29CQUNJLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtvQkFDckMsbUJBQW1CLEVBQUUsSUFBSTtvQkFDekIsTUFBTSxFQUFFLE1BQU07aUJBQ2pCLEVBQ0QsQ0FBQyxDQUNKLENBQ0osQ0FBQztZQUNOLENBQUM7WUFFRCxJQUFJLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQ3pCLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxFQUMxQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBeUIsT0FBTyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDNUYsR0FBRyxFQUNILEdBQUcsRUFDSCxFQUFFLEVBQ0YsRUFBRSxDQUNMLENBQUM7WUFFRixJQUFJLEdBQUcsR0FBRyxnQ0FBbUIsQ0FBQyxTQUFTLENBQUM7aUJBQ25DLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNaLEVBQUUsQ0FDRSxJQUFJLEVBQ0osYUFBSyxDQUNEO29CQUNJLE1BQU0sRUFBRSxNQUFNO29CQUNkLE1BQU0sRUFBRTt3QkFDSixVQUFVLEVBQUUsQ0FBQzt3QkFDYixNQUFNLEVBQUUsS0FBSztxQkFDaEI7b0JBQ0QsbUJBQW1CLEVBQUUsS0FBSztpQkFDN0IsRUFDRCxDQUFDLENBQ0osQ0FDSixDQUFDO1lBQ04sQ0FBQyxDQUFDO2lCQUNELEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNYLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDO1FBRVgsQ0FBQyxDQUFDLENBQUE7SUFFTixDQUFDLENBQUM7SUFFc0QsR0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFFN0UsTUFBTSxDQUF3RCxHQUFHLENBQUM7QUFDdEUsQ0FBQztBQXhGRCwrREF3RkMifQ==