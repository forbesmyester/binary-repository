import { Cmd, CmdSpawner, CmdOutput } from './CmdRunner';
import { Callback } from './Types';
export declare class CmdOutputDidNotMatchError extends Error {
    re: RegExp;
    output: CmdOutput[];
    constructor(msg: string, re: RegExp, output: CmdOutput[]);
}
export declare type SingleLineCmdResult = string;
export declare function singleLineCmdRunner({cmdSpawner}: {
    cmdSpawner: CmdSpawner;
}, cmd: Cmd, re: RegExp): (inArg: string, next: Callback<string>) => void;
