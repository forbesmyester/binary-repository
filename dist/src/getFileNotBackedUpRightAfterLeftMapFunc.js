"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function viaDb(left, right) {
    return (left.hasOwnProperty(right.path) &&
        left[right.path].fileByteCount == right.fileByteCount &&
        left[right.path].modifiedDate.toISOString() == right.modifiedDate.toISOString());
}
function default_1(dependencies) {
    return (lefts, right) => {
        for (let i = 0; i < lefts.length; i++) {
            if (viaDb(lefts[i], right)) {
                return [];
            }
        }
        return [right];
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RmlsZU5vdEJhY2tlZFVwUmlnaHRBZnRlckxlZnRNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldEZpbGVOb3RCYWNrZWRVcFJpZ2h0QWZ0ZXJMZWZ0TWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLGVBQWUsSUFBeUIsRUFBRSxLQUFXO0lBQ2pELE1BQU0sQ0FBQyxDQUNILElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsYUFBYTtRQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUNsRixDQUFDO0FBQ04sQ0FBQztBQUVELG1CQUF3QixZQUFnQjtJQUNwQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSztRQUNoQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNwQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNkLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkIsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQVRELDRCQVNDIn0=