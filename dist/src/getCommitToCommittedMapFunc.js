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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tbWl0VG9Db21taXR0ZWRNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldENvbW1pdFRvQ29tbWl0dGVkTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUFxRTtBQUNyRSxpQ0FBaUM7QUFDakMscUNBQThCO0FBRTlCLCtCQUErQztBQVcvQztJQUNJLE1BQU0sQ0FBQyxFQUFFLGVBQWUsRUFBZix5QkFBZSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ3ZDLENBQUM7QUFGRCwwRkFFQztBQUVELHFDQUE0QyxFQUFDLGVBQWUsRUFBRSxNQUFNLEVBQWUsRUFBRSxTQUFnQztJQUVqSCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDcEIsSUFBSSxNQUFNLEdBQUcsV0FBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUVwQyxJQUFJLFNBQVMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3JCLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ2pCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFBQyxDQUFDO2dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztJQUVGLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRW5ELE1BQU0sQ0FBQyxVQUFTLE1BQU0sRUFBRSxJQUFJO1FBQ3hCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNsQixDQUFDLENBQUMsTUFBTTtnQkFDUixDQUFDLENBQUMsU0FBUztnQkFDWCxDQUFDLENBQUMsYUFBYTtnQkFDZixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDM0IsQ0FBQyxDQUFDLDBCQUEwQjtnQkFDNUIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUU7Z0JBQzVCLENBQUMsQ0FBQyxJQUFJO2dCQUNOLENBQUMsQ0FBQyxNQUFNO2FBQ1gsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLGNBQWMsR0FBRyxnQkFBTSxDQUFDLHVCQUF1QixDQUMzQyxNQUFNLENBQUMsUUFBUSxFQUNmLE1BQU0sQ0FBQyxNQUFNLEVBQ2IsTUFBTSxDQUFDLFFBQVEsQ0FDbEIsRUFDRCxrQkFBa0IsR0FBRyxXQUFJLENBQ3JCLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsY0FBYyxDQUNqQixFQUNELE9BQU8sR0FBRyxXQUFJLENBQUMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUU3RSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMsRUFBRTthQUNHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakYsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDL0QsSUFBSSxDQUNELEdBQUcsRUFBRSxDQUFDLElBQUksQ0FDTixJQUFJLEVBQ0osTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFO1lBQ3RCLGdCQUFnQixFQUFFLFdBQUksQ0FBQyxlQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUN2RCxDQUFDLENBQ0wsQ0FDSjthQUNBLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFJcEMsQ0FBQyxDQUFDO0FBRU4sQ0FBQztBQTVERCxrRUE0REMifQ==