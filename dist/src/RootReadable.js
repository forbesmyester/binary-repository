"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stronger_typed_streams_1 = require("stronger-typed-streams");
const glob = require("glob");
class RootReadable extends stronger_typed_streams_1.Readable {
    constructor({ glob }, rootPath, ignorePattern, globPattern = '/**/*', opts = {}) {
        super(Object.assign({ objectMode: true }, opts));
        this.rootPath = rootPath;
        this.ignorePattern = ignorePattern;
        this.globPattern = globPattern;
        this.done = 0;
        this._readBeforeData = false;
        this._readAfterData = false;
        this.postConstruct(glob);
    }
    get readBeforeData() { return this._readBeforeData; }
    get readAfterData() { return this._readAfterData; }
    postConstruct(glob) {
        glob(this.rootPath, this.globPattern, this.ignorePattern, (err, files) => {
            if (err) {
                this.emit('error', err);
            }
            this.files = files ? files : [];
            this.done = 1;
            this.myRead();
        });
    }
    static getGlobFunc() {
        let globOpts = { nomount: true, nosort: true, silent: true, strict: true,
            nodir: true, follow: false };
        return (root, pattern, ignore, next) => {
            let opts = Object.assign({ root, ignore, cwd: root }, globOpts);
            return glob(pattern, opts, next);
        };
    }
    t(s) { return { path: s }; }
    _read(count) {
        if (this.done == 0) {
            this._readBeforeData = true;
        }
        if (this.done > 0) {
            this._readAfterData = true;
        }
        return this.myRead();
    }
    myRead() {
        if (this.done != 1) {
            return;
        }
        while (this.files.length) {
            this.done = 2;
            this._readAfterData = true;
            let v = this.files.shift().replace(/\/+/, '');
            this.push(this.t(v));
        }
        this.push(null);
    }
}
exports.RootReadable = RootReadable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vdFJlYWRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1Jvb3RSZWFkYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLG1FQUFrRDtBQUNsRCw2QkFBNkI7QUFPN0Isa0JBQTBCLFNBQVEsaUNBQWtCO0lBVWhELFlBQVksRUFBQyxJQUFJLEVBQWUsRUFBVSxRQUErQixFQUFVLGFBQXVCLEVBQVUsY0FBc0IsT0FBTyxFQUFFLElBQUksR0FBRyxFQUFFO1FBQ3hKLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFEVCxhQUFRLEdBQVIsUUFBUSxDQUF1QjtRQUFVLGtCQUFhLEdBQWIsYUFBYSxDQUFVO1FBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQWtCO1FBUHpJLFNBQUksR0FBRyxDQUFDLENBQUM7UUFDVCxvQkFBZSxHQUFHLEtBQUssQ0FBQztRQUN4QixtQkFBYyxHQUFHLEtBQUssQ0FBQztRQU8zQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFORCxJQUFJLGNBQWMsS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDckQsSUFBSSxhQUFhLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBTzNDLGFBQWEsQ0FBQyxJQUFJO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFlO1lBQzNFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7WUFDZCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQVc7UUFFZCxJQUFJLFFBQVEsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJO1lBQ3BFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO1FBRWpDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUk7WUFDL0IsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUM7SUFDTixDQUFDO0lBRU8sQ0FBQyxDQUFDLENBQVMsSUFBSSxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTVDLEtBQUssQ0FBQyxLQUFLO1FBQ1AsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFBQyxDQUFDO1FBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQUMsQ0FBQztRQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxNQUFNO1FBRUYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQUMsQ0FBQztRQUUvQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7WUFDZCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUMzQixJQUFJLENBQUMsR0FBWSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztDQUNKO0FBeERELG9DQXdEQyJ9