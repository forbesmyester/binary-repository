"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function atomicFileWrite(tmpPath, finalPath, contents) {
    return new Promise((resolve, reject) => {
        fs.writeFile(tmpPath, contents.join("\n"), { encoding: 'utf8' }, (err) => {
            if (err) {
                return reject(err);
            }
            fs.rename(tmpPath, finalPath, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(finalPath);
            });
        });
    });
}
exports.default = atomicFileWrite;
let f = atomicFileWrite; // Just to check that we meet the interface
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXRvbWljRmlsZVdyaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2F0b21pY0ZpbGVXcml0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUF5QjtBQU96Qix5QkFBd0MsT0FBeUIsRUFBRSxTQUEyQixFQUFFLFFBQWtCO0lBQzlHLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDckUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUNoQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDbEMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLENBQUM7Z0JBQ2hDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBVkQsa0NBVUM7QUFFRCxJQUFJLENBQUMsR0FBb0IsZUFBZSxDQUFDLENBQUMsMkNBQTJDIn0=