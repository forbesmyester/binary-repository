import { RightAfterLeftMapFunc } from 'streamdash';
import { File, BackupCheckDatabase, Filename } from './Types';
import { concat, reduce } from 'ramda';

export default function getLocallyDeletedFilesRightAfterLeftMapFunc(dependencies: {}): RightAfterLeftMapFunc<File, BackupCheckDatabase, Filename> {

    let filepathIndex = new Map();
    let builtFilepathIndex = false;

    return (lefts, right) => {
        if (!builtFilepathIndex) {
            for (let i = 0; i < lefts.length; i++) {
                filepathIndex.set(lefts[i].path, lefts[i]);
            }
        }

        let keys = Object.keys(right); 
        let reducer = (acc: Filename[], item: string) => {
            if (filepathIndex.has(item)) {
                return acc;
            }
            return concat(acc, [{ path: item }]);
        };

        return reduce(reducer, [], keys);

    };
}

