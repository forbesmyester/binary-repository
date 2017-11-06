import { Callback } from './Types';
import { spawn } from 'child_process';
import { Readable } from 'stronger-typed-streams';
export { Callback } from './Types';


export interface CmdOutput {
    name: string;
    text: string;
}

export type ExitStatus = number;

export class ExitStatusError extends Error {

    constructor(msg: string, public code: number, public output: CmdOutput[]) {
        super(msg);
    }

}

export type Cmd = string;
export type CmdArgument = string;
export type Environment = {[k: string]: string};
export type WorkingDirectory = string;

export interface CmdSpawner {
    (env, cwd: string, cmd: Cmd, args: CmdArgument[], out: (s: string) => void, err: (s: string) => void, next: Callback<ExitStatus>): void;
}

export class CmdRunner extends Readable<CmdOutput> {

    private out: CmdOutput[] = [];
    private outForError: CmdOutput[] = [];

    constructor({ cmdSpawner }: { cmdSpawner: CmdSpawner }, env: Environment, cwd: WorkingDirectory, cmd: Cmd, args: CmdArgument[], opts) {
        super(Object.assign({objectMode: true}, opts));

        let filterEndNl = (s) => s.replace(/[\n\r]+$/, "");

        let add = (name) => (text) => {
            if (text instanceof Buffer) {
                text = text.toString('utf8');
            }
            this.out.push({name: name, text: filterEndNl(text)});
            this.myRead();
            this.outForError.push({name: name, text: filterEndNl(text)});
            while (this.outForError.length > 256) {
                this.outForError.shift();
            }
        };

        cmdSpawner(env, cwd, cmd, args, add('stdout'), add('stderr'), (err: Error, exitStatus: ExitStatus) => {
            this.myRead();
            if (err) {
                this.emit('error', err);
                this.push(null);
                return;
            }
            if (exitStatus !== 0) {
                this.emit(
                    'error',
                    new ExitStatusError(
                        `Command ${cmd} with environment ${JSON.stringify(env)} exited with exit code ${exitStatus}`,
                        exitStatus,
                        this.outForError
                    )
                );
            }
            process.nextTick(() => { this.push(null); });
        });
    }

    static getCmdSpawner(baseEnvironment: Environment = {}): CmdSpawner {
        return (
            env: Environment,
            cwd: WorkingDirectory,
            cmd: Cmd,
            args: CmdArgument[],
            out: (s: string) => void,
            err: (s: string) => void,
            next
        ) => {
            let proc = spawn(cmd, args, { cwd, env: Object.assign({}, baseEnvironment, env) });
            proc.stdout.on('data', (out));
            proc.stderr.on('data', (err));
            proc.on('close', ((code) => {
                next(null, code);
            }));
        };
    }

    _read(count) {
        return this.myRead();
    }

    myRead() {
        while (this.out.length) {
            let line = <CmdOutput>this.out.shift();
            this.push(line);
        }
    }
}


