"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
function getCommittedToUploadedCommittedMapFunc(commitPath, s3Bucket, gpgKey, cmd
    // TODO: Pass in CmdSpawner
) {
    return function (a, cb) {
        cb(null, ramda_1.assoc('result', { exitStatus: 0, output: [] }, a));
    };
}
exports.default = getCommittedToUploadedCommittedMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tbWl0dGVkVG9VcGxvYWRlZENvbW1pdHRlZEZha2VNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldENvbW1pdHRlZFRvVXBsb2FkZWRDb21taXR0ZWRGYWtlTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLGlDQUE4QjtBQUU5QixnREFDSSxVQUFpQyxFQUNqQyxRQUFzQixFQUN0QixNQUFjLEVBQ2QsR0FBZ0I7SUFDaEIsMkJBQTJCOztJQUczQixNQUFNLENBQUMsVUFBUyxDQUFZLEVBQUUsRUFBRTtRQUU1QixFQUFFLENBQUMsSUFBSSxFQUFFLGFBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUMsQ0FBQztBQUVOLENBQUM7QUFiRCx5REFhQyJ9