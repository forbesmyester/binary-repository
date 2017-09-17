import test from 'ava';
import { MapFunc } from 'streamdash';
import { BASE_TLID_TIMESTAMP, BASE_TLID_UNIQUENESS, BackupRecord, Operation, Callback2, Callback, CommitFilename, ClientId, Commit, AbsoluteDirectoryPath } from '../src/Types';
import { join } from 'path';
import * as getTlIdEncoderDecoder from 'get_tlid_encoder_decoder';

export interface Dependencies {
    readFile(path: string, opts: { encoding: string }, cb: Callback2<string>);
}

let tlIdEncoderDecoder = getTlIdEncoderDecoder(BASE_TLID_TIMESTAMP, BASE_TLID_UNIQUENESS);

class NotCommitFileError extends Error {}

let lineRe = /^([0-9a-f]+);([0-9]);([0-9]+);([0-9]+_[0-9]+);([^;]+);(.*)/;
let filenameRe = /\/*([^\/]+)\-([^\/]+)\.commit$/;

function toRecord(str): BackupRecord|null {
    let m = str.match(lineRe);
    if (m === null) { return m; }

    return {
        sha256: m[1],
        operation: parseInt(m[2]),
        fileByteCount: parseInt(m[3]),
        modifiedDate: new Date(m[5]),
        path: m[6],
        part: m[4].split("_").map(a => parseInt(a, 10))
    };
}

export default function({ readFile }: Dependencies, configDir: AbsoluteDirectoryPath): MapFunc<CommitFilename, Commit> {


    return (a: CommitFilename, next: Callback<Commit>): void => {
        readFile(join(configDir, a.commitType, a.path), { encoding: 'utf8' }, (err, contents) => {

            if (err) { return next(err); }

            let filenameMatch = a.path.match(filenameRe);

            if (!filenameMatch) {
                throw new NotCommitFileError(
                    `The filename '${a.path}' does not look like a commit file`
                );
            }

            let commit: Commit = {
                createdAt: new Date(tlIdEncoderDecoder.decode(filenameMatch[1])),
                record: <BackupRecord[]>contents.split(/[\r\n]+/)
                    .map(toRecord)
                    .filter(a => a !== null),
                commitId: filenameMatch[1],
                clientId: filenameMatch[2]
            };

            next(null, commit);
        });
    };
}
