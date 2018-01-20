import { Callback, AbsoluteFilePath, AbsoluteDirectoryPath, Sha256, File, Sha256File } from  './Types';
import { MapFunc } from 'streamdash';
import Client from './Client';
import { join } from 'path';
import { createReadStream } from 'fs';
import { createHash } from 'crypto';

export function getRunner() {
    return function(fullPath: AbsoluteFilePath, next: Callback<Sha256>) {
        let hash = createHash('sha256');
        let strm = createReadStream(fullPath);
        let finished = false;
        strm.on('data', (d) => {
            hash.update(d, 'utf8')
        });
        strm.on('error', (e) => {
            if (!finished) {
                finished = true;
                next(e);
            }
        });
        strm.on('end', () => {
            if (finished) { return; }
            finished = true;
            next(null, hash.digest('hex'));
        });
    };
}

export function getFileToSha256FileMapFunc({ runner }: { runner: MapFunc<AbsoluteFilePath, Sha256> }, rootPath: AbsoluteDirectoryPath): MapFunc<File, Sha256File> {
    return function(f: File, next) {

        let fullPath: AbsoluteFilePath = join(rootPath, f.path);

        if (f.fileByteCount === 0) {
            return next(
                null,
                Object.assign(
                    { sha256: Client.zeroShaSum },
                    f
                )
            );
        }

        runner(fullPath, (err, sha256: Sha256) => {
            if (err) { return next(err); }
            next(null, Object.assign({ sha256 }, f));
        });

    };
}
