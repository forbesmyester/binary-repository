"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
function getCommitToBackupCheckDatabaseScanFunc(dependencies) {
    return function getCommitToBackupCheckDatabaseScanFunc(acc, a, next) {
        let partDb = ramda_1.reduce((recordAcc, record) => {
            if (record.part[0] == record.part[1]) {
                return ramda_1.assoc(record.path, ramda_1.pick(['modifiedDate', 'fileByteCount', 'sha256'], record), recordAcc);
            }
            return recordAcc;
        }, {}, a.record);
        next(null, ramda_1.merge(acc, partDb));
    };
}
exports.default = getCommitToBackupCheckDatabaseScanFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tbWl0VG9CYWNrdXBDaGVja0RhdGFiYXNlU2NhbkZ1bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0Q29tbWl0VG9CYWNrdXBDaGVja0RhdGFiYXNlU2NhbkZ1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxpQ0FBbUQ7QUFLbkQsZ0RBQStELFlBQTBCO0lBRXJGLE1BQU0sQ0FBQyxnREFBZ0QsR0FBd0IsRUFBRSxDQUFTLEVBQUUsSUFBb0M7UUFDNUgsSUFBSSxNQUFNLEdBQXdCLGNBQU0sQ0FDcEMsQ0FBQyxTQUFTLEVBQUUsTUFBTTtZQUNkLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE1BQU0sQ0FBQyxhQUFLLENBQ1IsTUFBTSxDQUFDLElBQUksRUFDWCxZQUFJLENBQUMsQ0FBQyxjQUFjLEVBQUUsZUFBZSxFQUFFLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUN6RCxTQUFTLENBQ1osQ0FBQztZQUNOLENBQUM7WUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3JCLENBQUMsRUFDb0IsRUFBRSxFQUN2QixDQUFDLENBQUMsTUFBTSxDQUNYLENBQUM7UUFDRixJQUFJLENBQUMsSUFBSSxFQUFFLGFBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDLENBQUM7QUFFTixDQUFDO0FBcEJELHlEQW9CQyJ9