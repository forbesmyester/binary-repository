import { AbsoluteDirectoryPath, Callback, Filename } from './Types';
export { AbsoluteDirectoryPath } from './Types';
export { Callback } from './Types';
import { Readable } from 'stronger-typed-streams';
import * as glob from 'glob';

export interface GlobFunc {
    (root: AbsoluteDirectoryPath, pattern: string, ignore: string[], next: Callback<string[]>): void;
}

export class RootReadable extends Readable<Filename> {

    private files: string[];
    private pendingCount = 0;
    private readCount = 0;
    private _readBeforeData = false;
    private _readAfterData = false;

    get readBeforeData() { return this._readBeforeData; }
    get readAfterData() { return this._readAfterData; }

    constructor({glob}: {glob: GlobFunc}, private rootPath: AbsoluteDirectoryPath, private ignorePattern: string[], private globPattern: string = '/**/*', opts = {}) {
        super(Object.assign({objectMode: true}, opts));
        this.postConstruct(glob);
    }

    private postConstruct(glob) {
        glob(this.rootPath, this.globPattern, this.ignorePattern, (err, files: string[]) => {
            if (err) { this.emit('error', err); }
            this.files = files ? files : [];
            this.readCount = this.files.length;
            this.readCount = -1;
            this.myRead();
        });
    }

    static getGlobFunc(): GlobFunc {

        let globOpts = { nomount: true, nosort: true, silent: true, strict: true,
            nodir: true, follow: false };

        return (root, pattern, ignore, next) => {
            let opts = Object.assign({ root, ignore }, globOpts);
            return glob(pattern, opts, next);
        };
    }

    private t(s: string) { return { path: s }; }

    _read(count) {
        this.pendingCount = this.pendingCount + count;
        if (this.readCount == 0) { this._readBeforeData = true; }
        if (this.readCount > 0) { this._readAfterData = true; }
        return this.myRead();
    }

    myRead() {

        while (this.readCount && this.files.length && this.pendingCount-- > 0) {
            this._readAfterData = true;
            this.push(this.t(<string>this.files.shift()));
        }

        if ((this.readCount == -1) && (this.files.length === 0)) {
            this.push(null);
        }
    }
}


