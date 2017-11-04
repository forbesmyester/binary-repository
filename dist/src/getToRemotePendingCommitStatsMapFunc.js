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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9SZW1vdGVQZW5kaW5nQ29tbWl0U3RhdHNNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldFRvUmVtb3RlUGVuZGluZ0NvbW1pdFN0YXRzTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUErQjtBQUUvQiwyQ0FBK0M7QUFDL0MsaUNBQThCO0FBQzlCLDJDQUF3QztBQUN4Qyw2RUFBcUY7QUFDckYsMkJBQTBCO0FBRzFCLCtCQUE0QjtBQWlCNUI7SUFFSSxJQUFJLFVBQVUsR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFDNUMsTUFBTSxHQUFHLHNDQUFTLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBRW5DLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBSixTQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDNUIsQ0FBQztBQU5ELDBDQU1DO0FBRUQsOENBQTZELEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBZ0IsRUFBRSxRQUErQjtJQUV4SCxtQkFDSSxHQUFrQyxFQUNsQyxVQUE2QyxFQUM3QyxJQUE2QztRQUU3QyxJQUFJLFFBQVEsR0FBcUIsV0FBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUQsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNO1lBQ3pCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUFDLENBQUM7WUFDOUIsSUFBSSxFQUFFLEdBQUcsYUFBSyxDQUNWLFFBQVEsRUFDUixNQUFNLEVBQ04sVUFBVSxDQUNiLENBQUM7WUFDRixJQUFJLENBQUMsSUFBSSxFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZ0JBQ0ksR0FBa0MsRUFDbEMsSUFBNkM7UUFFN0MsSUFBSSxRQUFRLEdBQXFCLFdBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFELGlCQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLENBQUM7WUFDMUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoRCxDQUFDO1lBQ0QsSUFBSSxNQUFNLEdBQUc7Z0JBQ1QsYUFBYSxFQUFFLENBQUMsQ0FBQyxJQUFJO2dCQUNyQixZQUFZLEVBQUUsQ0FBQyxDQUFDLEtBQUs7YUFDeEIsQ0FBQztZQUNGLEVBQUUsQ0FBQyxDQUNDLENBQUMsTUFBTSxDQUFDLGFBQWEsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDO2dCQUMzQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksR0FBRyxDQUFDLFlBQVksQ0FDNUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3hDLENBQUM7WUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBR0QsTUFBTSxDQUFDLENBQUMsSUFBNkIsRUFBRSxJQUFJO1FBRXZDLHFCQUFRLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTztZQUV2QyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFBQyxDQUFDO1lBRTlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrR0FBa0csQ0FBQyxDQUFDO1lBQ3hILENBQUM7WUFFRCxJQUFJLENBQ0EsSUFBSSxFQUNKLGFBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUNqQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFHUCxDQUFDLENBQUM7QUFFTixDQUFDO0FBL0RELHVEQStEQyJ9