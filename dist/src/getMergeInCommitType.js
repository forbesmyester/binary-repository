"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
function getMergeInCommitType(toMerge) {
    return function objectMergeFunc(input, next) {
        next(null, ramda_1.merge(input, toMerge));
    };
}
exports.getMergeInCommitType = getMergeInCommitType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0TWVyZ2VJbkNvbW1pdFR5cGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0TWVyZ2VJbkNvbW1pdFR5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxpQ0FBOEI7QUFFOUIsOEJBQXFDLE9BQW1CO0lBRXBELE1BQU0sQ0FBQyx5QkFBeUIsS0FBSyxFQUFFLElBQUk7UUFDdkMsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUFDO0FBRU4sQ0FBQztBQU5ELG9EQU1DIn0=