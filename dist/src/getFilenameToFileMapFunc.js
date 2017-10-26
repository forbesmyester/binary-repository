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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RmlsZW5hbWVUb0ZpbGVNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldEZpbGVuYW1lVG9GaWxlTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLCtCQUE0QjtBQU01QixrQ0FBeUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxRQUErQjtJQUM5RSxNQUFNLENBQUMsQ0FBQyxDQUFXLEVBQUUsSUFBSTtRQUNyQixJQUFJLFFBQVEsR0FBcUIsV0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNyQixhQUFhLEVBQUUsQ0FBQyxDQUFDLElBQUk7Z0JBQ3JCLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNyRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztBQUVOLENBQUM7QUFaRCw0REFZQyJ9