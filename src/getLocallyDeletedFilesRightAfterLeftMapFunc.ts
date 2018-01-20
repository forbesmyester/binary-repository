import { RightAfterLeftMapFunc } from 'streamdash';
import { Operation, File, BackupRecord, Commit, Filename } from './Types';
import { reduce } from 'ramda';

export default function getLocallyDeletedFilesRightAfterLeftMapFunc(dependencies: {}): RightAfterLeftMapFunc<Commit, File, Filename> {

    let committedFileIndex = new Map<string, boolean>();
    let builtFilepathIndex = false;

    let reducer = (acc: Map<string,boolean>, rec: BackupRecord) => {
        acc.set(rec.path, false);
        if (rec.operation == Operation.Delete) {
            acc.delete(rec.path);
        }
        return acc;
    };

    return (lefts: Commit[], right: File, isLast: boolean) => {

        if (!builtFilepathIndex) {
            for (let i = 0; i < lefts.length; i++) {
                committedFileIndex = reduce(
                    reducer,
                    committedFileIndex,
                    lefts[i].record
                );
            }
            builtFilepathIndex = true;
        }

        if (committedFileIndex.has(right.path)) {
            committedFileIndex.delete(right.path);
        }

        if (!isLast) {
            return [];
        }

        return Array.from(committedFileIndex.keys()).map(
            (a) => { return { path: a }; }
        );

    };
}

