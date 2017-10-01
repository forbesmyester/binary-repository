import myStat from './myStats';
import { Stats, stat as realStat} from 'fs';
import { join } from 'path';
import { MapFunc } from 'streamdash';
import { pipe, range, assoc, dissoc, map } from 'ramda';
import { FilePartIndex, S3Object, S3Location, RemotePendingCommitStatRecordDecided, AbsoluteFilePath, AbsoluteDirectoryPath, RemotePendingCommitStat, Callback, S3BucketName, ByteCount } from './Types';

export interface Dependencies {
    stat: (f: AbsoluteFilePath, cb: (err: null|NodeJS.ErrnoException, stats: Stats) => void) => void;
    download: (loc: S3Location, next: Callback<void>) => void;
    downloadSize: (loc: S3Location, next: Callback<ByteCount>) => void;
}

interface NeedsDownload extends RemotePendingCommitStatRecordDecided {
    perform: boolean;
}

export default function getToDownloadedParts({stat, downloadSize, download}: Dependencies, configDir: AbsoluteDirectoryPath, s3Bucket: S3BucketName): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat> {

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
        if (!a.perform) return Promise.resolve(a);
        return new Promise((resolve, reject) => {
            download([s3Bucket, constructObject(a)] , (e, r) => {
                if (e) { return reject(e); }
                resolve(a);
            });
        });
    }

    function constructObject(a: NeedsDownload): S3Object {
        return `f-${a.sha256}-${a.part[0]}.ebak`;
    }

    function checkDownloaded(a: NeedsDownload): Promise<NeedsDownload> {
        if (!a.perform) return Promise.resolve(a);
        return Promise.all([
            pMyStat(join(configDir, constructObject(a))),
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

