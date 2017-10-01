import { AbsoluteFilePath, S3Location, Callback, AbsoluteDirectoryPath, ByteCount } from '../Types';
import { createReadStream, createWriteStream, rename, stat } from 'fs';
import RepositoryAbstract from './RepositoryAbstract';
import { join } from 'path';

let RepositoryLocalfiles: RepositoryAbstract = {

    downloadSize: (loc: S3Location, next: Callback<ByteCount>) => {
        let absoluteFilepath: AbsoluteFilePath = join(loc[0], loc[1]);
        stat(absoluteFilepath, (e, s) => {
            if (e) { return next(e); }
            next(null, s.size);
        });
    },

    download: (tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>) => {
        let nexted = false;
        let tmp = join(tmpDir, loc[1]);
        let read = createReadStream(join(loc[0], loc[1]));
        let write = createWriteStream(tmp);
        read.on('error', (e) => { nexted ? null : next(e); nexted = true; });
        write.on('error', (e) => { nexted ? null : next(e); nexted = true; });
        write.on('close', (e) => {
            if (e) { return next(e); }
            if (nexted) { return; }
            rename(tmp, downloadTo, next);
        });
        read.pipe(write);
    }

};

export default RepositoryLocalfiles;