import { Stats } from 'fs';
export default function myStat(stat, f: string, cb: (err: null|NodeJS.ErrnoException, stats: null|Stats) => void): void {
    stat(f, (e: null|NodeJS.ErrnoException, s: Stats) => {
        if (e === null) { return cb(e, s); }
        if (e.code == 'ENOENT') { return cb(null, null); }
        cb(e, null);
    });
}


