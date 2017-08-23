import { Commit, Committed, AbsoluteDirectoryPath, RelativeFilePath } from './Types';
import atomicFileWrite, { AtomicFileWrite } from './atomicFileWrite';
import * as mkdirp from 'mkdirp';
import { MapFunc } from 'streamdash';
import { join } from 'path';

export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}

export interface Dependencies {
    atomicFileWrite: AtomicFileWrite;
    mkdirp: MkdirP;
}

export function getCommitToCommittedMapFuncDependencies(): Dependencies {
    return { atomicFileWrite, mkdirp };
}

export function getCommitToCommittedMapFunc({atomicFileWrite, mkdirp}: Dependencies, rootPath: AbsoluteDirectoryPath, tmpDir: AbsoluteDirectoryPath, commitDir: AbsoluteDirectoryPath): MapFunc<Commit, Committed> {

    let created = false;

    let createDir = (path) => {
        return new Promise((resolve, reject) => {
            mkdirp(path, (err) => {
                if (err) { return reject(err); }
                resolve(true);
            });
        });
    };

    let noop = () => { return Promise.resolve(true); };

    return function(commit, next) {
        let lines = commit.record.map(r => {
            return `${r.sha256};${r.operation};${r.fileByteCount};` +
                `${r.part[0]}_${r.part[1]};${r.modifiedDate.toISOString()};` +
                `${r.path}`;
        });

        let filename = commit.commitId + '-' + commit.clientId + '.commit';
        let tmpFile = join(tmpDir, filename);
        let commitFile = join(commitDir, filename);

        let p1 = created ? noop() : createDir(tmpDir);
        p1
            .then(() => { return created ? noop() : createDir(commitDir); })
            .then(() => atomicFileWrite(tmpFile, commitFile, lines))
            .then(
                () => next(
                    null,
                    Object.assign({}, commit, {
                        relativeFilePath: join(filename)
                    })
                ),
                (e) => { next(e); }
            );



    };

}
