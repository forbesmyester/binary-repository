import { AbsoluteDirectoryPath, Callback, Filename } from './Types';
export { AbsoluteDirectoryPath } from './Types';
export { Callback } from './Types';
import { Readable } from 'stronger-typed-streams';
import * as glob from 'glob';

export interface GlobFunc {
    (root: AbsoluteDirectoryPath, pattern: string, ignore: string[], next: Callback<string[]>): void;
}
export interface Dependencies {glob: GlobFunc; }

export class RootReadable extends Readable<Filename> {

    private files: string[];
    private done = 0;
    private _readBeforeData = false;
    private _readAfterData = false;

    get readBeforeData() { return this._readBeforeData; }
    get readAfterData() { return this._readAfterData; }

    constructor({glob}: Dependencies, private rootPath: AbsoluteDirectoryPath, private ignorePattern: string[], private globPattern: string = '/**/*', opts = {}) {
        super(Object.assign({objectMode: true}, opts));
        this.postConstruct(glob);
    }

    private postConstruct(glob) {
        glob(this.rootPath, this.globPattern, this.ignorePattern, (err, files: string[]) => {
            if (err) { this.emit('error', err); }
            this.files = files ? files : [];
            this.done = 1;
            this.myRead();
        });
    }

    static getGlobFunc(): GlobFunc {

        let globOpts = { nomount: true, nosort: true, silent: true, strict: true,
            nodir: true, follow: false };

        return (root, pattern, ignore, next) => {
            let opts = Object.assign({ root, ignore, cwd: root }, globOpts);
            return glob(pattern, opts, next);
        };
    }

    private t(s: string) { return { path: s }; }

    _read(count) {
        if (this.done == 0) { this._readBeforeData = true; }
        if (this.done > 0) { this._readAfterData = true; }
        return this.myRead();
    }

    myRead() {

        if (this.done != 1) { return; }

        while (this.files.length) {
            this.done = 2;
            this._readAfterData = true;
            let v = (<string>this.files.shift()).replace(/\/+/, '');
            this.push(this.t(v));
        }

        this.push(null);
    }
}


