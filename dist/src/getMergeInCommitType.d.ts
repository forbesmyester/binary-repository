import { CommitType, Filename, CommitFilename } from './Types';
import { MapFunc } from 'streamdash';
export declare function getMergeInCommitType(toMerge: CommitType): MapFunc<Filename, CommitFilename>;
