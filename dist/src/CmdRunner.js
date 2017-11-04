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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ21kUnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0NtZFJ1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUFzQztBQUN0QyxtRUFBa0Q7QUFXbEQscUJBQTZCLFNBQVEsS0FBSztJQUV0QyxZQUFZLEdBQVcsRUFBUyxJQUFZLEVBQVMsTUFBbUI7UUFDcEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRGlCLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFhO0lBRXhFLENBQUM7Q0FFSjtBQU5ELDBDQU1DO0FBV0QsZUFBdUIsU0FBUSxpQ0FBbUI7SUFLOUMsWUFBWSxFQUFFLFVBQVUsRUFBOEIsRUFBRSxHQUFnQixFQUFFLEdBQXFCLEVBQUUsR0FBUSxFQUFFLElBQW1CLEVBQUUsSUFBSTtRQUNoSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBSjNDLFFBQUcsR0FBZ0IsRUFBRSxDQUFDO1FBQ3RCLGdCQUFXLEdBQWdCLEVBQUUsQ0FBQztRQUtsQyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVuRCxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUk7WUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUM7WUFD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