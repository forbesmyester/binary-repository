"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserErrorCode;
(function (UserErrorCode) {
    UserErrorCode[UserErrorCode["BLOCKED_BY_FILE"] = 1] = "BLOCKED_BY_FILE";
    UserErrorCode[UserErrorCode["FILE_MODIFIED_BEFORE_LOCAL_COMMIT"] = 2] = "FILE_MODIFIED_BEFORE_LOCAL_COMMIT";
    UserErrorCode[UserErrorCode["FILE_MODIFIED_AFTER_LOCAL_COMMIT_BUT_NO_SHA256"] = 3] = "FILE_MODIFIED_AFTER_LOCAL_COMMIT_BUT_NO_SHA256";
})(UserErrorCode = exports.UserErrorCode || (exports.UserErrorCode = {}));
class UserError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.UserError = UserError;
var RemoteType;
(function (RemoteType) {
    RemoteType[RemoteType["LOCAL_FILES"] = 1] = "LOCAL_FILES";
    RemoteType[RemoteType["S3"] = 2] = "S3";
})(RemoteType = exports.RemoteType || (exports.RemoteType = {}));
/**
 * An operation that has occured upon a file
 */
var Operation;
(function (Operation) {
    Operation[Operation["Create"] = 1] = "Create";
    // Modify = 2, // I am not sure that this is a thing yet... enum reserved
    //             // incase it becomes so (as I like nice sequential numbers!
    Operation[Operation["Delete"] = 3] = "Delete";
})(Operation = exports.Operation || (exports.Operation = {}));
exports.BASE_TLID_TIMESTAMP = new Date('2017-07-22T08:54:05.274Z').getTime();
exports.BASE_TLID_UNIQUENESS = 3;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSxJQUFZLGFBSVg7QUFKRCxXQUFZLGFBQWE7SUFDckIsdUVBQW1CLENBQUE7SUFDbkIsMkdBQXFDLENBQUE7SUFDckMscUlBQWtELENBQUE7QUFDdEQsQ0FBQyxFQUpXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBSXhCO0FBR0QsZUFBdUIsU0FBUSxLQUFLO0lBQ2pDLFlBQVksT0FBZSxFQUFTLElBQW1CO1FBQ25ELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQURpQixTQUFJLEdBQUosSUFBSSxDQUFlO0lBRXZELENBQUM7Q0FDSDtBQUpELDhCQUlDO0FBK0JELElBQVksVUFHWDtBQUhELFdBQVksVUFBVTtJQUNsQix5REFBZSxDQUFBO0lBQ2YsdUNBQU0sQ0FBQTtBQUNWLENBQUMsRUFIVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQUdyQjtBQXdDRDs7R0FFRztBQUNILElBQVksU0FLWDtBQUxELFdBQVksU0FBUztJQUNqQiw2Q0FBVSxDQUFBO0lBQ1YseUVBQXlFO0lBQ3pFLDBFQUEwRTtJQUMxRSw2Q0FBVSxDQUFBO0FBQ2QsQ0FBQyxFQUxXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBS3BCO0FBMkVZLFFBQUEsbUJBQW1CLEdBQUcsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyRSxRQUFBLG9CQUFvQixHQUFHLENBQUMsQ0FBQyJ9