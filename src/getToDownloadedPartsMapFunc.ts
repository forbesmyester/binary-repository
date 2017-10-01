import myStat from './myStats';
import { rename, createReadStream, createWriteStream, Stats, stat as realStat} from 'fs';
import { join } from 'path';
import { MapFunc } from 'streamdash';
import { pipe, range, assoc, dissoc, map } from 'ramda';
import { FilePartIndex, S3Object, S3Location, RemotePendingCommitStatRecordDecided, AbsoluteFilePath, AbsoluteDirectoryPath, RemotePendingCommitStat, Callback, S3BucketName, ByteCount } from './Types';
import * as mkdirp from 'mkdirp';
import RepositoryLocalfiles from './repository/RepositoryLocalfiles';


export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}

export interface Dependencies {
    stat: (f: AbsoluteFilePath, cb: (err: null|NodeJS.ErrnoException, stats: Stats) => void) => void;
    download: (tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>) => void;
    downloadSize: (loc: S3Location, next: Callback<ByteCount>) => void;
    mkdirp: MkdirP;
}

interface NeedsDownload extends RemotePendingCommitStatRecordDecided {
    perform: boolean;
}

export enum Mode {
    LOCAL_FILES = 1,
    S3 = 2,
}

export function getDependencies(mode: Mode): Dependencies {
    if (mode != Mode.LOCAL_FILES) {
        throw new Error("Unsupported");
    }
    return {
        mkdirp,
        stat: realStat,
        download: RepositoryLocalfiles.download,
        downloadSize: RepositoryLocalfiles.downloadSize
    };

}

export default function getToDownloadedParts({mkdirp, stat, downloadSize, download}: Dependencies, configDir: AbsoluteDirectoryPath, s3Bucket: S3BucketName): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat> {

    let tmpDir = join(configDir, 'tmp'),
        filepartDir = join(configDir, 'remote-encrypted-filepart');

    function pDownloadSize(l: S3Location): Promise<ByteCount|null> {
        return new Promise((resolve, reject) => {
            downloadSize(l, (e, r) => {
                if (e) { return reject(e); }
                resolve(r);
            });
        });
    }

    function pMyStat(ap: AbsoluteFilePath): Promise<Stats|null> {
        return new Promise((resolve, reject) => {
            myStat(stat, ap, (e, r) => {
                if (e) { return reject(e); }
                resolve(r);
            });
        });
    }


    function doDownloaded(a: NeedsDownload): Promise<NeedsDownload> {
        // TODO: Yeh Yeh, it's a Christmas tree... do something about it!
        if (!a.perform) return Promise.resolve(a);
        return new Promise((resolve, reject) => {
            mkdirp(tmpDir, (e) => {
                if (e) { return reject(e); }
                mkdirp(filepartDir, (e) => {
                    if (e) { return reject(e); }
                    download(
                        tmpDir,
                        [s3Bucket, constructObject(a)],
                        join(filepartDir, constructFilepart(a)),
                        (e, r) => {
                            if (e) { return reject(e); }
                            resolve(a);
                        }
                    );
                });
            });
        });
    }

    function constructFilepart(a: NeedsDownload): S3Object {
        return `${a.sha256}-${a.part[0]}.ebak`;
    }

    function constructObject(a: NeedsDownload): S3Object {
        return 'f-' + constructFilepart(a);
    }

    function checkDownloaded(a: NeedsDownload): Promise<NeedsDownload> {
        if (!a.perform) return Promise.resolve(a);
        return Promise.all([
            pMyStat(join(filepartDir, constructFilepart(a))),
            pDownloadSize([s3Bucket, constructObject(a)])
        ]).then(([stats, downloadSize]) => {
            if (stats === null) { return a; }
            if (stats.size == downloadSize) {
                return assoc('perform', false, a);
            }
            return a;
        });
    }

    function checkNotLast(a: RemotePendingCommitStatRecordDecided): Promise<NeedsDownload[]> {
        if (a.part[0] < a.part[1]) {
            return Promise.resolve([assoc('perform', false, a)]);
        }
        let r = map(part0 => {
            return assoc('perform', true,
                    assoc('part', [part0, a.part[1]],
                        a));
        }, range(1, a.part[1] + 1));
        return Promise.resolve(r);
    }

    function multi(f: (a: NeedsDownload) => Promise<NeedsDownload>) {
        return function(inputs: NeedsDownload[]) {
            return Promise.all(
                map(f, inputs)
            );
        };
    }

    function process(a: RemotePendingCommitStatRecordDecided): Promise<RemotePendingCommitStatRecordDecided> {
        return checkNotLast(a)
            .then(multi(checkDownloaded))
            .then(multi(doDownloaded))
            .then((_: NeedsDownload[]) => {
                return a;
            });
    }

    return function(input, next) {
        Promise.all(map(process, input.record))
            .then(record => {
                next(
                    null,
                    assoc('record', record, input)
                );
            })
            .catch(e => { next(e); });
    };
}

