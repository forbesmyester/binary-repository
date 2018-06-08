import { MapFunc } from 'streamdash';
import { BackupCheckDatabase } from '../src/Types';
import { pickBy } from 'ramda';

export type FilenameFilter = string & {};

export function getFilenameFilter(s: string):FilenameFilter {
    return s;
}

export interface Dependencies {}

export default function getMapBackupCheckDatabaseByFilenameFilter({}: Dependencies, filenameFilter: FilenameFilter): MapFunc<BackupCheckDatabase, BackupCheckDatabase> {
    return (a, next) => {
        let result: BackupCheckDatabase = pickBy(
            (v, k) => {
                return (k.indexOf(filenameFilter) == 0)
            },
            a
        );
        next(null, result);
    };
}
