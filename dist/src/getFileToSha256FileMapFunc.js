"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const singleLineCmdRunner_1 = require("./singleLineCmdRunner");
const path_1 = require("path");
function getRunner({ cmdSpawner }) {
    return singleLineCmdRunner_1.singleLineCmdRunner({ cmdSpawner }, "sha256sum", /^([a-z0-9]{64})/);
}
exports.getRunner = getRunner;
function getFileToSha256FileMapFunc({ runner }, rootPath) {
    return function (f, next) {
        let fullPath = path_1.join(rootPath, f.path);
        if (f.fileByteCount === 0) {
            return next(null, Object.assign({ sha256: "0000000000000000000000000000000000000000000000000000000000000000" }, f));
        }
        runner(fullPath, (err, sha256) => {
            if (err) {
                return next(err);
            }
            next(null, Object.assign({ sha256 }, f));
        });
    };
}
exports.getFileToSha256FileMapFunc = getFileToSha256FileMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RmlsZVRvU2hhMjU2RmlsZU1hcEZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0RmlsZVRvU2hhMjU2RmlsZU1hcEZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSwrREFBNEQ7QUFDNUQsK0JBQTRCO0FBRzVCLG1CQUEwQixFQUFFLFVBQVUsRUFBNEI7SUFDOUQsTUFBTSxDQUFDLHlDQUFtQixDQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFDL0UsQ0FBQztBQUZELDhCQUVDO0FBRUQsb0NBQTJDLEVBQUUsTUFBTSxFQUFpRCxFQUFFLFFBQStCO0lBQ2pJLE1BQU0sQ0FBQyxVQUFTLENBQU8sRUFBRSxJQUFJO1FBRXpCLElBQUksUUFBUSxHQUFxQixXQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4RCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLElBQUksQ0FDUCxJQUFJLEVBQ0osTUFBTSxDQUFDLE1BQU0sQ0FDVCxFQUFFLE1BQU0sRUFBRSxrRUFBa0UsRUFBRSxFQUM5RSxDQUFDLENBQ0osQ0FDSixDQUFDO1FBQ04sQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBYyxFQUFFLEVBQUU7WUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO0lBRVAsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQXJCRCxnRUFxQkMifQ==