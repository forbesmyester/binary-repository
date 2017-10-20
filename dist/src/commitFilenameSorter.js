"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const getTlidEncoderDecoder = require("get_tlid_encoder_decoder");
let tlidEncoderDecoder = getTlidEncoderDecoder(Types_1.BASE_TLID_TIMESTAMP, Types_1.BASE_TLID_UNIQUENESS);
// TODO: Write tests for this.
function default_1(a, b) {
    let tlidRe = /.*\/(.*)\-.*\.commit$/;
    let ap = a.path.match(tlidRe);
    let bp = b.path.match(tlidRe);
    if ((!ap) || (!bp)) {
        return 0;
    }
    return tlidEncoderDecoder.sort(ap[1], bp[1]);
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWl0RmlsZW5hbWVTb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWl0RmlsZW5hbWVTb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBOEU7QUFDOUUsa0VBQWtFO0FBRWxFLElBQUksa0JBQWtCLEdBQUcscUJBQXFCLENBQUMsMkJBQW1CLEVBQUUsNEJBQW9CLENBQUMsQ0FBQztBQUUxRiw4QkFBOEI7QUFFOUIsbUJBQXdCLENBQVcsRUFBRSxDQUFXO0lBQzVDLElBQUksTUFBTSxHQUFHLHVCQUF1QixDQUFDO0lBQ3JDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQ0QsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakQsQ0FBQztBQVJELDRCQVFDIn0=