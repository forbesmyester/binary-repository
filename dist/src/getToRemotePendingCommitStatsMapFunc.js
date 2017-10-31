"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const myStats_1 = require("./myStats");
const streamdash_1 = require("streamdash");
const ramda_1 = require("ramda");
const CmdRunner_1 = require("./CmdRunner");
const getFileToSha256FileMapFunc_1 = require("./getFileToSha256FileMapFunc");
const fs_1 = require("fs");
const path_1 = require("path");
function getDependencies() {
    let cmdSpawner = CmdRunner_1.CmdRunner.getCmdSpawner({}), runner = getFileToSha256FileMapFunc_1.getRunner({ cmdSpawner });
    return { stat: fs_1.stat, runner };
}
exports.getDependencies = getDependencies;
function getToRemotePendingCommitStatsMapFunc({ stat, runner }, rootPath) {
    function addSha256(rec, statResult, next) {
        let fullPath = path_1.join(rootPath, rec.path);
        runner(fullPath, (err, sha256) => {
            if (err) {
                return next(err);
            }
            let sr = ramda_1.assoc('sha256', sha256, statResult);
            next(null, ramda_1.assoc('stat', sr, rec));
        });
    }
    function worker(rec, next) {
        let fullPath = path_1.join(rootPath, rec.path);
        myStats_1.default(stat, fullPath, (e, s) => {
            if (e) {
                return next(e);
            }
            if (s === null) {
                return next(null, ramda_1.assoc('stat', null, rec));
            }
            let result = {
                fileByteCount: s.size,
                modifiedDate: s.mtime
            };
            if ((result.fileByteCount == rec.fileByteCount) &&
                (result.modifiedDate != rec.modifiedDate)) {
                return addSha256(rec, result, next);
            }
            next(null, ramda_1.assoc('stat', result, rec));
        });
    }
    return (rpci, next) => {
        streamdash_1.asyncMap(worker, rpci.record, (err, results) => {
            if (err) {
                return next(err);
            }
            if ((results === undefined) || (results.length !== rpci.record.length)) {
                throw new Error("Somehow getToRemotePendingCommitStatsMapFunc did not fail but did not return a consistent result");
            }
            next(null, ramda_1.assoc('record', results, rpci));
        });
    };
}
exports.default = getToRemotePendingCommitStatsMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0U3RhdHNNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldFRvUmVtb3RlUGVuZGluZ0NvbW1pdFN0YXRzTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUErQjtBQUUvQiwyQ0FBK0M7QUFDL0MsaUNBQThCO0FBQzlCLDJDQUF3QztBQUN4Qyw2RUFBcUY7QUFDckYsMkJBQTBCO0FBRzFCLCtCQUE0QjtBQWlCNUI7SUFFSSxJQUFJLFVBQVUsR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFDNUMsTUFBTSxHQUFHLHNDQUFTLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBRW5DLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBSixTQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDNUIsQ0FBQztBQU5ELDBDQU1DO0FBRUQsOENBQTZELEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBZ0IsRUFBRSxRQUErQjtJQUV4SCxtQkFDSSxHQUFrQyxFQUNsQyxVQUE2QyxFQUM3QyxJQUE2QztRQUU3QyxJQUFJLFFBQVEsR0FBcUIsV0FBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUQsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUM3QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFBQyxDQUFDO1lBQzlCLElBQUksRUFBRSxHQUFHLGFBQUssQ0FDVixRQUFRLEVBQ1IsTUFBTSxFQUNOLFVBQVUsQ0FDYixDQUFDO1lBQ0YsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGdCQUNJLEdBQWtDLEVBQ2xDLElBQTZDO1FBRTdDLElBQUksUUFBUSxHQUFxQixXQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRCxpQkFBTSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUMxQixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDYixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFDRCxJQUFJLE1BQU0sR0FBRztnQkFDVCxhQUFhLEVBQUUsQ0FBQyxDQUFDLElBQUk7Z0JBQ3JCLFlBQVksRUFBRSxDQUFDLENBQUMsS0FBSzthQUN4QixDQUFDO1lBQ0YsRUFBRSxDQUFDLENBQ0MsQ0FBQyxNQUFNLENBQUMsYUFBYSxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUM7Z0JBQzNDLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsWUFBWSxDQUM1QyxDQUFDLENBQUMsQ0FBQztnQkFDQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUNELElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHRCxNQUFNLENBQUMsQ0FBQyxJQUE2QixFQUFFLElBQUksRUFBRSxFQUFFO1FBRTNDLHFCQUFRLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFFM0MsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUU5QixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JFLE1BQU0sSUFBSSxLQUFLLENBQUMsa0dBQWtHLENBQUMsQ0FBQztZQUN4SCxDQUFDO1lBRUQsSUFBSSxDQUNBLElBQUksRUFDSixhQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FDakMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO0lBR1AsQ0FBQyxDQUFDO0FBRU4sQ0FBQztBQS9ERCx1REErREMifQ==