import { Sha256File, AbsoluteDirectoryPath, AbsoluteFilePath, File, Filename } from '../src/Types';
import { MapFunc } from 'streamdash';
import { join } from 'path';

export function getFilenameToFileMapFunc({ stat }, rootPath: AbsoluteDirectoryPath): MapFunc<Filename, File> {
    return (f: Filename, next) => {
        let fullPath: AbsoluteFilePath = join(rootPath, f.path);
        stat(fullPath, (e, s) => {
            if (e) { return next(e); }
            next(null, Object.assign({ fileByteCount: s.size, modifiedDate: s.mtime }, f));
        });
    };

}
