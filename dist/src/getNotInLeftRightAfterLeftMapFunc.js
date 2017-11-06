"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
function getNotInLeftRightAfterLeftMapFunc(dependencies) {
    return (lefts, right) => {
        for (let l of lefts) {
            let toCompare = ramda_1.pickAll(ramda_1.keys(right), l);
            if (ramda_1.equals(toCompare, right)) {
                return [];
            }
        }
        return [right];
    };
}
exports.default = getNotInLeftRightAfterLeftMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Tm90SW5MZWZ0UmlnaHRBZnRlckxlZnRNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldE5vdEluTGVmdFJpZ2h0QWZ0ZXJMZWZ0TWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlDQUE4QztBQUU5QywyQ0FBNkQsWUFBZ0I7SUFDekUsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxTQUFTLEdBQUcsZUFBTyxDQUNuQixZQUFJLENBQUMsS0FBSyxDQUFDLEVBQ1gsQ0FBQyxDQUNKLENBQUM7WUFDRixFQUFFLENBQUMsQ0FBQyxjQUFNLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNkLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkIsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQWJELG9EQWFDIn0=