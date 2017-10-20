import { RemotePendingCommitStatRecordDecided, UserError, RemotePendingCommitStat } from './Types';
import { MapFunc } from 'streamdash';
export interface Dependencies {
}
export declare class DeciderUserError extends UserError {
    paths: any;
    constructor(msg: any, code: any, paths: any);
}
export interface RemotePendingCommitStatRecordDecidedX extends RemotePendingCommitStatRecordDecided {
    block: boolean;
    majorError?: null;
}
export default function getToRemotePendingCommitDeciderMapFunc(d: Dependencies): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat>;
