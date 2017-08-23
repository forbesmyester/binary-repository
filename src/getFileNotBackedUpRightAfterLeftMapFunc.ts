import { RightAfterLeftMapFunc } from 'streamdash';
import { File, BackupCheckDatabase } from './Types';

function viaDb(left: BackupCheckDatabase, right: File) {
    return (
        left.hasOwnProperty(right.path) &&
        left[right.path].fileByteCount == right.fileByteCount &&
        left[right.path].modifiedDate.toISOString() == right.modifiedDate.toISOString()
    );
}

export default function(dependencies: {}): RightAfterLeftMapFunc<BackupCheckDatabase, File, File> {
    return (lefts, right) => {
        for (let i = 0; i < lefts.length; i++) {
            if (viaDb(lefts[i], right)) {
                return [];
            }
        }
        return [right];
    };
}

