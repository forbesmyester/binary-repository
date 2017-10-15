import myStat from './myStats';
import Client from './Client';
import { rename, createReadStream, createWriteStream, Stats, stat as realStat} from 'fs';
import { mapLimit } from 'async';
import { join } from 'path';
import { MapFunc } from 'streamdash';
import throat = require('throat');
import { flatten, pipe, range, assoc, dissoc, map } from 'ramda';
import { GpgKey, RemoteType, FilePartIndex, S3Object, S3Location, RemotePendingCommitStatRecordDecided, AbsoluteFilePath, AbsoluteDirectoryPath, RemotePendingCommitStat, Callback, S3BucketName, ByteCount } from './Types';
import * as mkdirp from 'mkdirp';
import RepositoryLocalfiles from './repository/RepositoryLocalfiles';
import RepositoryS3 from './repository/RepositoryS3';

export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}

export interface Dependencies {
    stat: (f: AbsoluteFilePath, cb: (err: null|NodeJS.ErrnoException, stats: Stats) => void) => void;
    download: (tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>) => void;
    downloadSize: (loc: S3Location, next: Callback<ByteCount>) => void;
    mkdirp: MkdirP;
    constructFilepartS3Location: (s3Bucket: S3BucketName, gpgKey: GpgKey, rec: RemotePendingCommitStatRecordDecided) => S3Location;
    constructFilepartLocalLocation: (configDir: AbsoluteDirectoryPath, gpgKey: GpgKey, rec: RemotePendingCommitStatRecordDecided) => AbsoluteFilePath;
}

export function getDependencies(mode: RemoteType): Dependencies {

    if (mode == RemoteType.S3) {
        return {
            mkdirp,
            stat: realStat,
            download: RepositoryS3.download,
            downloadSize: RepositoryS3.downloadSize,
            constructFilepartS3Location: RepositoryS3.constructFilepartS3Location,
            constructFilepartLocalLocation: Client.constructFilepartLocalLocation
        };
    }

    if (mode == RemoteType.LOCAL_FILES) {
        return {
            mkdirp,
            stat: realStat,
            download: RepositoryLocalfiles.download,
            downloadSize: RepositoryLocalfiles.downloadSize,
            constructFilepartS3Location: RepositoryLocalfiles.constructFilepartS3Location,
            constructFilepartLocalLocation: Client.constructFilepartLocalLocation
        };
    }

    throw new Error("Unsupported");

}

export default function getToDownloadedParts({ constructFilepartLocalLocation, constructFilepartS3Location, mkdirp, stat, downloadSize, download }: Dependencies, configDir: AbsoluteDirectoryPath, s3Bucket: S3BucketName): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat> {

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


    function doDownloaded(gpgKey: GpgKey, a: RemotePendingCommitStatRecordDecided): Promise<RemotePendingCommitStatRecordDecided> {
        // TODO: Yeh Yeh, it's a Christmas tree... do something about it!
        if (!a.proceed) return Promise.resolve(a);
        return new Promise((resolve, reject) => {
            mkdirp(tmpDir, (e) => {
                if (e) { return reject(e); }
                mkdirp(filepartDir, (e) => {
                    if (e) { return reject(e); }
                    download(
                        tmpDir,
                        constructFilepartS3Location(s3Bucket, gpgKey, a),
                        constructFilepartLocalLocation(configDir, gpgKey, a),
                        (e, r) => {
                            if (e) { return reject(e); }
                            resolve(a);
                        }
                    );
                });
            });
        });
    }

    function constructFilepart(a: RemotePendingCommitStatRecordDecided): S3Object {
        return Client.constructFilepartFilename(
            a.sha256,
            a.part
        );
    }

    function checkDownloaded(gpgKey: GpgKey, a: RemotePendingCommitStatRecordDecided): Promise<RemotePendingCommitStatRecordDecided> {
        // TODO: Derive arg for pDonwloadSize from Driver
        if (!a.proceed) return Promise.resolve(a);
        return Promise.all([
            pMyStat(join(filepartDir, constructFilepart(a))),
            pDownloadSize(
                constructFilepartS3Location(s3Bucket, gpgKey, a)
            )
        ]).then(([stats, downloadSize]) => {
            if (stats === null) { return a; }
            if (stats.size == downloadSize) {
                return assoc('proceed', false, a);
            }
            return a;
        });
    }

    function spawnPartsIfLast(a: RemotePendingCommitStatRecordDecided): Promise<RemotePendingCommitStatRecordDecided[]> {
        if (!a.proceed) {
            return Promise.resolve([a]);
        }
        let r = map(part0 => {
            return assoc('part', [part0, a.part[1]], a);
        }, range(1, a.part[1] + 1));
        return Promise.resolve(r);
    }

    function multi(f: (a: RemotePendingCommitStatRecordDecided) => Promise<RemotePendingCommitStatRecordDecided>) {
        let ff = throat(3, f);
        return function(inputs: RemotePendingCommitStatRecordDecided[]) {
            return Promise.all(
                map(ff, inputs)
            );
        };
    }

    function process(a: RemotePendingCommitStatRecordDecided, next: Callback<RemotePendingCommitStatRecordDecided>) {
        let max = a.part[1];
        spawnPartsIfLast(a)
            .then(multi(checkDownloaded.bind(null, max)))
            .then(multi(doDownloaded.bind(null, max)))
            .then((aa: RemotePendingCommitStatRecordDecided[]) => {
                next(null, a);
            })
            .catch((e) => { next(e); });
    }

    return function(input, next) {
        mapLimit(
            input.record,
            2,
            process,
            (e: Error|null) => { next(e, input); }
        );
    };
}

