"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const getTlidEncoderDecoder = require("get_tlid_encoder_decoder");
const Client_1 = require("./Client");
let tlidEncoderDecoder = getTlidEncoderDecoder(Types_1.BASE_TLID_TIMESTAMP, Types_1.BASE_TLID_UNIQUENESS);
// TODO: Write tests for this.
function default_1(a, b) {
    let api = Client_1.default.infoFromCommitFilename(a.path);
    let bpi = Client_1.default.infoFromCommitFilename(b.path);
    if ((!api.commitId) || (!bpi.commitId)) {
        console.log("NO SORT!");
        throw new Error(`Could not decode a filename ${a} or ${b}`);
    }
    return tlidEncoderDecoder.sort(api.commitId, bpi.commitId);
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWl0RmlsZW5hbWVTb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWl0RmlsZW5hbWVTb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBOEU7QUFDOUUsa0VBQWtFO0FBQ2xFLHFDQUE4QjtBQUU5QixJQUFJLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDLDJCQUFtQixFQUFFLDRCQUFvQixDQUFDLENBQUM7QUFFMUYsOEJBQThCO0FBRTlCLG1CQUF3QixDQUFXLEVBQUUsQ0FBVztJQUM1QyxJQUFJLEdBQUcsR0FBRyxnQkFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRCxJQUFJLEdBQUcsR0FBRyxnQkFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUNELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQVJELDRCQVFDIn0=