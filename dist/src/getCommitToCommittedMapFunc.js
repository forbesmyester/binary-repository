"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atomicFileWrite_1 = require("./atomicFileWrite");
const mkdirp = require("mkdirp");
const Client_1 = require("./Client");
const path_1 = require("path");
function getCommitToCommittedMapFuncDependencies() {
    return { atomicFileWrite: atomicFileWrite_1.default, mkdirp };
}
exports.getCommitToCommittedMapFuncDependencies = getCommitToCommittedMapFuncDependencies;
function getCommitToCommittedMapFunc({ atomicFileWrite, mkdirp }, configDir) {
    let created = false;
    let tmpDir = path_1.join(configDir, 'tmp');
    let createDir = (path) => {
        return new Promise((resolve, reject) => {
            mkdirp(path, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(true);
            });
        });
    };
    let noop = () => { return Promise.resolve(true); };
    return function (commit, next) {
        let lines = commit.record.map(r => {
            return JSON.stringify([
                r.sha256,
                r.operation,
                r.fileByteCount,
                `${r.part[0]}_${r.part[1]}`,
                r.filePartByteCountThreshold,
                r.modifiedDate.toISOString(),
                r.path,
                r.gpgKey
            ]);
        });
        let commitFilename = Client_1.default.constructCommitFilename(commit.commitId, commit.gpgKey, commit.clientId), commitFullFilename = path_1.join(configDir, 'pending-commit', commitFilename), tmpFile = path_1.join(tmpDir, commitFullFilename.replace(/[^a-zA-Z0-9]/g, '_'));
        let p1 = created ? noop() : createDir(tmpDir);
        p1
            .then(() => { return created ? noop() : createDir(path_1.dirname(commitFullFilename)); })
            .then(() => atomicFileWrite(tmpFile, commitFullFilename, lines))
            .then(() => next(null, Object.assign({}, commit, {
            relativeFilePath: path_1.join(path_1.basename(commitFullFilename))
        })))
            .catch((e) => { next(e); });
    };
}
exports.getCommitToCommittedMapFunc = getCommitToCommittedMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tbWl0VG9Db21taXR0ZWRNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldENvbW1pdFRvQ29tbWl0dGVkTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUFxRTtBQUNyRSxpQ0FBaUM7QUFDakMscUNBQThCO0FBRzlCLCtCQUErQztBQVcvQztJQUNJLE1BQU0sQ0FBQyxFQUFFLGVBQWUsRUFBZix5QkFBZSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ3ZDLENBQUM7QUFGRCwwRkFFQztBQUVELHFDQUE0QyxFQUFDLGVBQWUsRUFBRSxNQUFNLEVBQWUsRUFBRSxTQUFnQztJQUVqSCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDcEIsSUFBSSxNQUFNLEdBQUcsV0FBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUVwQyxJQUFJLFNBQVMsR0FBRyxDQUFDLElBQUk7UUFDakIsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU07WUFDL0IsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUc7Z0JBQ2IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLENBQUM7Z0JBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0lBRUYsSUFBSSxJQUFJLEdBQUcsUUFBUSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVuRCxNQUFNLENBQUMsVUFBUyxNQUFNLEVBQUUsSUFBSTtRQUN4QixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNsQixDQUFDLENBQUMsTUFBTTtnQkFDUixDQUFDLENBQUMsU0FBUztnQkFDWCxDQUFDLENBQUMsYUFBYTtnQkFDZixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDM0IsQ0FBQyxDQUFDLDBCQUEwQjtnQkFDNUIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUU7Z0JBQzVCLENBQUMsQ0FBQyxJQUFJO2dCQUNOLENBQUMsQ0FBQyxNQUFNO2FBQ1gsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLGNBQWMsR0FBRyxnQkFBTSxDQUFDLHVCQUF1QixDQUMzQyxNQUFNLENBQUMsUUFBUSxFQUNmLE1BQU0sQ0FBQyxNQUFNLEVBQ2IsTUFBTSxDQUFDLFFBQVEsQ0FDbEIsRUFDRCxrQkFBa0IsR0FBRyxXQUFJLENBQ3JCLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsY0FBYyxDQUNqQixFQUNELE9BQU8sR0FBRyxXQUFJLENBQUMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUU3RSxJQUFJLEVBQUUsR0FBRyxPQUFPLEdBQUcsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLEVBQUU7YUFDRyxJQUFJLENBQUMsUUFBUSxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQyxjQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pGLElBQUksQ0FBQyxNQUFNLGVBQWUsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDL0QsSUFBSSxDQUNELE1BQU0sSUFBSSxDQUNOLElBQUksRUFDSixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUU7WUFDdEIsZ0JBQWdCLEVBQUUsV0FBSSxDQUFDLGVBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3ZELENBQUMsQ0FDTCxDQUNKO2FBQ0EsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBSXBDLENBQUMsQ0FBQztBQUVOLENBQUM7QUE1REQsa0VBNERDIn0=