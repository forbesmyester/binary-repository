import { RightAfterLeftMapFunc } from 'streamdash';
import { File, BackupCheckDatabase } from './Types';
export default function (dependencies: {}): RightAfterLeftMapFunc<BackupCheckDatabase, File, File>;
