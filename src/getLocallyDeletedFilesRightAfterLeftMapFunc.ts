import { RightAfterLeftMapFunc } from 'streamdash';
import { File, BackupRecord, Commit, Filename } from './Types';
import { map, concat, reduce } from 'ramda';

export default function getLocallyDeletedFilesRightAfterLeftMapFunc(dependencies: {}): RightAfterLeftMapFunc<File, Commit, Filename> {

    let filepathIndex = new Map();
    let builtFilepathIndex = false;

    return (lefts: File[], right: Commit) => {
        if (!builtFilepathIndex) {
            for (let i = 0; i < lefts.length; i++) {
                filepathIndex.set(lefts[i].path, lefts[i]);
            }
        }

        let cFilenames = map(
            (r: BackupRecord) => { return r.path; },
            right.record
        );
        let reducer = (acc: Filename[], item: string) => {
            if (filepathIndex.has(item)) {
                return acc;
            }
            return concat(acc, [{ path: item }]);
        };

        return reduce(reducer, [], cFilenames);

    };
}

