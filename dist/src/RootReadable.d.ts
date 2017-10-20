import { AbsoluteDirectoryPath, Callback, Filename } from './Types';
export { AbsoluteDirectoryPath } from './Types';
export { Callback } from './Types';
import { Readable } from 'stronger-typed-streams';
export interface GlobFunc {
    (root: AbsoluteDirectoryPath, pattern: string, ignore: string[], next: Callback<string[]>): void;
}
export interface Dependencies {
    glob: GlobFunc;
}
export declare class RootReadable extends Readable<Filename> {
    private rootPath;
    private ignorePattern;
    private globPattern;
    private files;
    private done;
    private _readBeforeData;
    private _readAfterData;
    readonly readBeforeData: boolean;
    readonly readAfterData: boolean;
    constructor({glob}: Dependencies, rootPath: AbsoluteDirectoryPath, ignorePattern: string[], globPattern?: string, opts?: {});
    private postConstruct(glob);
    static getGlobFunc(): GlobFunc;
    private t(s);
    _read(count: any): void;
    myRead(): void;
}
