"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function getFilenameToFileMapFunc({ stat }, rootPath) {
    return (f, next) => {
        let fullPath = path_1.join(rootPath, f.path);
        stat(fullPath, (e, s) => {
            if (e) {
                return next(e);
            }
            next(null, Object.assign({
                fileByteCount: s.size,
                modifiedDate: new Date(s.mtime.setMilliseconds(0))
            }, f));
        });
    };
}
exports.getFilenameToFileMapFunc = getFilenameToFileMapFunc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RmlsZW5hbWVUb0ZpbGVNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldEZpbGVuYW1lVG9GaWxlTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLCtCQUE0QjtBQU01QixrQ0FBeUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxRQUErQjtJQUM5RSxNQUFNLENBQUMsQ0FBQyxDQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDekIsSUFBSSxRQUFRLEdBQXFCLFdBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ3JCLGFBQWEsRUFBRSxDQUFDLENBQUMsSUFBSTtnQkFDckIsWUFBWSxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3JELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0FBRU4sQ0FBQztBQVpELDREQVlDIn0=