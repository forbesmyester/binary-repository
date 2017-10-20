import { RightAfterLeftMapFunc } from 'streamdash';
import { BackupCheckDatabase, RemotePendingCommit, RemotePendingCommitInfo } from './Types';
export interface Dependencies {
}
export default function getToRemotePendingCommitInfoRightAfterLeftMapFunc(dependencies: Dependencies): RightAfterLeftMapFunc<BackupCheckDatabase, RemotePendingCommit, RemotePendingCommitInfo>;
