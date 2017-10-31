"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const stronger_typed_streams_1 = require("stronger-typed-streams");
class ExitStatusError extends Error {
    constructor(msg, code, output) {
        super(msg);
        this.code = code;
        this.output = output;
    }
}
exports.ExitStatusError = ExitStatusError;
class CmdRunner extends stronger_typed_streams_1.Readable {
    constructor({ cmdSpawner }, env, cwd, cmd, args, opts) {
        super(Object.assign({ objectMode: true }, opts));
        this.out = [];
        this.outForError = [];
        let filterEndNl = (s) => s.replace(/[\n\r]+$/, "");
        let add = (name) => (text) => {
            if (text instanceof Buffer) {
                text = text.toString('utf8');
            }
            this.out.push({ name: name, text: filterEndNl(text) });
            this.myRead();
            this.outForError.push({ name: name, text: filterEndNl(text) });
            while (this.outForError.length > 256) {
                this.outForError.shift();
            }
        };
        cmdSpawner(env, cwd, cmd, args, add('stdout'), add('stderr'), (err, exitStatus) => {
            this.myRead();
            if (err) {
                this.emit('error', err);
                this.push(null);
                return;
            }
            if (exitStatus !== 0) {
                this.emit('error', new ExitStatusError(`Command exited with exit code ${exitStatus}`, exitStatus, this.outForError));
            }
            process.nextTick(() => { this.push(null); });
        });
    }
    static getCmdSpawner(baseEnvironment = {}) {
        return (env, cwd, cmd, args, out, err, next) => {
            let proc = child_process_1.spawn(cmd, args, { cwd, env: Object.assign({}, baseEnvironment, env) });
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
            let line = this.out.shift();
            this.push(line);
        }
    }
}
exports.CmdRunner = CmdRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ21kUnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0NtZFJ1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUFzQztBQUN0QyxtRUFBa0Q7QUFXbEQscUJBQTZCLFNBQVEsS0FBSztJQUV0QyxZQUFZLEdBQVcsRUFBUyxJQUFZLEVBQVMsTUFBbUI7UUFDcEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRGlCLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFhO0lBRXhFLENBQUM7Q0FFSjtBQU5ELDBDQU1DO0FBV0QsZUFBdUIsU0FBUSxpQ0FBbUI7SUFLOUMsWUFBWSxFQUFFLFVBQVUsRUFBOEIsRUFBRSxHQUFnQixFQUFFLEdBQXFCLEVBQUUsR0FBUSxFQUFFLElBQW1CLEVBQUUsSUFBSTtRQUNoSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBSjNDLFFBQUcsR0FBZ0IsRUFBRSxDQUFDO1FBQ3RCLGdCQUFXLEdBQWdCLEVBQUUsQ0FBQztRQUtsQyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFbkQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FB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