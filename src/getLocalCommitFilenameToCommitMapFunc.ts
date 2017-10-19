import test from 'ava';
import { MapFunc } from 'streamdash';
import { GpgKey, BackupRecord, Operation, Callback2, Callback, CommitFilename, ClientId, Commit, AbsoluteDirectoryPath } from '../src/Types';
import { join } from 'path';
import Client from './Client';

export interface Dependencies {
    readFile(path: string, opts: { encoding: string }, cb: Callback2<string>);
}

function toRecord(str): BackupRecord|null {
    let m = JSON.parse(str);
    if (m === null) { return m; }

    return {
        sha256: m[0],
        operation: parseInt(m[1]),
        fileByteCount: parseInt(m[2]),
        modifiedDate: new Date(m[5]),
        path: m[6],
        part: m[3].split("_").map(a => parseInt(a, 10)),
        filePartByteCountThreshold: m[4],
        gpgKey: m[7]
    };
}

export default function({ readFile }: Dependencies, configDir: AbsoluteDirectoryPath): MapFunc<CommitFilename, Commit> {


    return (a: CommitFilename, next: Callback<Commit>): void => {
        readFile(join(configDir, a.commitType, a.path), { encoding: 'utf8' }, (err, contents) => {

            if (err) { return next(err); }

            let commit: Commit = Object.assign(
                Client.infoFromCommitFilename(a.path),
                {
                record: <BackupRecord[]>contents.split(/[\r\n]+/)
                    .map(toRecord)
                    .filter(a => a !== null)
                }
            );

            next(null, commit);
        });
    };
}
