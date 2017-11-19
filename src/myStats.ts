import { Stats } from 'fs';

function round(d: number): number {
    return Math.floor(d / 1000) * 1000;
}

export default function myStat(stat, f: string, cb: (err: null|NodeJS.ErrnoException, stats: null|Stats) => void): void {
    stat(f, (e: null|NodeJS.ErrnoException, s: Stats) => {

        let ss: Stats = s ? Object.assign({}, s, {
            atimeMs: (s.atimeMs ? round(s.atimeMs) : null),
            mtimeMs: (s.mtimeMs ? round(s.mtimeMs) : null),
            ctimeMs: (s.ctimeMs ? round(s.ctimeMs) : null),
            birthtimeMs: (s.birthtimeMs ? round(s.birthtimeMs) : null),
            atime: (s.atime ? new Date(round(s.atime.getTime())) : null),
            mtime: (s.mtime ? new Date(round(s.mtime.getTime())) : null),
            ctime: (s.ctime ? new Date(round(s.ctime.getTime())) : null),
            birthtime: (s.birthtime ? new Date(round(s.birthtime.getTime())) : null)
        }): s;

        if (e === null) { return cb(e, ss); }
        if (e.code == 'ENOENT') { return cb(null, null); }



        cb(e, null);
    });
}


