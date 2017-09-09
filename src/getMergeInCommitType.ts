import { CommitType, Filename, CommitFilename } from './Types';
import { MapFunc } from 'streamdash';
import { merge } from 'ramda';

export function getMergeInCommitType(toMerge: CommitType): MapFunc<Filename, CommitFilename> {

    return function objectMergeFunc(input, next) {
        next(null, merge(input, toMerge));
    };

}
