"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CmdRunner_1 = require("./CmdRunner");
const streamdash_1 = require("streamdash");
class CmdOutputDidNotMatchError extends Error {
    constructor(msg, re, output) {
        super(msg);
        this.re = re;
        this.output = output;
    }
}
exports.CmdOutputDidNotMatchError = CmdOutputDidNotMatchError;
function singleLineCmdRunner({ cmdSpawner }, cmd, re) {
    return (inArg, next) => {
        let c = new CmdRunner_1.CmdRunner({ cmdSpawner }, {}, ".", cmd, [inArg], {});
        streamdash_1.streamDataCollector(c, (err, lines) => {
            if (err !== null) {
                return next(err);
            }
            let results = lines.filter(({ name }) => name == 'stdout')
                .map(({ text }) => text.match(re))
                .filter((r) => r)
                .map((r) => r[1]);
            if (!results.length) {
                return next(new CmdOutputDidNotMatchError(`No lines matching '${re.source}' found`, re, lines));
            }
            next(null, results[0]);
        });
    };
}
exports.singleLineCmdRunner = singleLineCmdRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlTGluZUNtZFJ1bm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zaW5nbGVMaW5lQ21kUnVubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQWlGO0FBRWpGLDJDQUFpRDtBQUdqRCwrQkFBdUMsU0FBUSxLQUFLO0lBS2hELFlBQVksR0FBVyxFQUFFLEVBQVUsRUFBRSxNQUFtQjtRQUNwRCxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7Q0FFSjtBQVhELDhEQVdDO0FBSUQsNkJBQW9DLEVBQUUsVUFBVSxFQUE0QixFQUFFLEdBQVEsRUFBRSxFQUFVO0lBQzlGLE1BQU0sQ0FBQyxDQUFDLEtBQWtCLEVBQUUsSUFBbUMsRUFBRSxFQUFFO1FBQy9ELElBQUksQ0FBQyxHQUFHLElBQUkscUJBQVMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakUsZ0NBQW1CLENBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBRTdDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckIsQ0FBQztZQUVELElBQUksT0FBTyxHQUFpQixLQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQztpQkFDcEUsR0FBRyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNsQyxHQUFHLENBQUMsQ0FBQyxDQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUV6QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUkseUJBQXlCLENBQ3JDLHNCQUFzQixFQUFFLENBQUMsTUFBTSxTQUFTLEVBQ3hDLEVBQUUsRUFDWSxLQUFNLENBQ3ZCLENBQUMsQ0FBQztZQUNQLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQTFCRCxrREEwQkMifQ==