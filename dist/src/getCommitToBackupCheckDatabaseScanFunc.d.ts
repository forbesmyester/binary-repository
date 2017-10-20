import { ScanFunc } from 'streamdash';
import { Commit, BackupCheckDatabase } from '../src/Types';
export interface Dependencies {
}
export default function getCommitToBackupCheckDatabaseScanFunc(dependencies: Dependencies): ScanFunc<Commit, BackupCheckDatabase>;
