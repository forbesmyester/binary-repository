/// <reference types="node" />
import { Stats } from 'fs';
export default function myStat(stat: any, f: string, cb: (err: null | NodeJS.ErrnoException, stats: null | Stats) => void): void;
