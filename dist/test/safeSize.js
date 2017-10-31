"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const safeSize_1 = require("../src/safeSize");
ava_1.default("do it", (tst) => {
    tst.is(safeSize_1.default(1048576), true); // 1M
    tst.is(safeSize_1.default(1024), true); // 1K
    tst.is(safeSize_1.default(2222), false); // Just wierd
    tst.is(safeSize_1.default(512), false); // Too small (0.5K)
    tst.is(safeSize_1.default(5242880), true); // 5M
    tst.is(safeSize_1.default(5242881), false); // 5M + 1B
    tst.is(safeSize_1.default(5242879), false); // 5M - 1B
    tst.is(safeSize_1.default(5241856), false); // 5M - 1K
    tst.is(safeSize_1.default(1073741824), true); // 1G (Max)
    tst.is(safeSize_1.default(1073741824 * 2), false); // 2G (above max - due to laziness)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FmZVNpemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0L3NhZmVTaXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQXVCO0FBQ3ZCLDhDQUF1QztBQUd2QyxhQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFFbEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxrQkFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSztJQUN0QyxHQUFHLENBQUMsRUFBRSxDQUFDLGtCQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO0lBQ25DLEdBQUcsQ0FBQyxFQUFFLENBQUMsa0JBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWE7SUFDNUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxrQkFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQW1CO0lBQ2pELEdBQUcsQ0FBQyxFQUFFLENBQUMsa0JBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7SUFDdEMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxrQkFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVTtJQUM1QyxHQUFHLENBQUMsRUFBRSxDQUFDLGtCQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxVQUFVO0lBQzVDLEdBQUcsQ0FBQyxFQUFFLENBQUMsa0JBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVU7SUFDNUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVztJQUMvQyxHQUFHLENBQUMsRUFBRSxDQUFDLGtCQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsbUNBQW1DO0FBQ2hGLENBQUMsQ0FBQyxDQUFDIn0=