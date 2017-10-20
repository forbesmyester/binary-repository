import { Callback } from './Types';
import { Readable } from 'stronger-typed-streams';
export { Callback } from './Types';
export interface CmdOutput {
    name: string;
    text: string;
}
export declare type ExitStatus = number;
export declare class ExitStatusError extends Error {
    code: number;
    output: CmdOutput[];
    constructor(msg: string, code: number, output: CmdOutput[]);
}
export declare type Cmd = string;
export declare type CmdArgument = string;
export declare type Environment = {
    [k: string]: string;
};
export declare type WorkingDirectory = string;
export interface CmdSpawner {
    (env: any, cwd: string, cmd: Cmd, args: CmdArgument[], out: (s: string) => void, err: (s: string) => void, next: Callback<ExitStatus>): void;
}
export declare class CmdRunner extends Readable<CmdOutput> {
    private out;
    private outForError;
    constructor({cmdSpawner}: {
        cmdSpawner: CmdSpawner;
    }, env: Environment, cwd: WorkingDirectory, cmd: Cmd, args: CmdArgument[], opts: any);
    static getCmdSpawner(baseEnvironment?: Environment): CmdSpawner;
    _read(count: any): void;
    myRead(): void;
}
