import myStat from './myStats';
import Client from './Client';
import { Stats, stat as realStat} from 'fs';
import { mapLimit } from 'async';
import { dirname, join } from 'path';
import { MapFunc } from 'streamdash';
import throat = require('throat');
import { range, assoc, map } from 'ramda';
import { Operation, CommitId, NotificationHandler, GpgKey, RemoteType, S3Object, S3Location, RemotePendingCommitStatRecordDecided, AbsoluteFilePath, AbsoluteDirectoryPath, RemotePendingCommitStat, Callback, S3BucketName, ByteCount } from './Types';
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
    constructFilepartLocalLocation: (configDir: AbsoluteDirectoryPath, gpgKey: GpgKey, commitId: CommitId, rec: RemotePendingCommitStatRecordDecided) => AbsoluteFilePath;
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

/**
 * NOTE: Paralleism is set to 1 here, because temp files are named after SHA and
 *       if there are multiple files in a commit with the same SHA...
 */

export default function getToDownloadedParts({ constructFilepartLocalLocation, constructFilepartS3Location, mkdirp, stat, downloadSize, download }: Dependencies, configDir: AbsoluteDirectoryPath, s3Bucket: S3BucketName, notificationHandler?: NotificationHandler): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat> {

    let tmpDir = join(configDir, 'tmp'),
        filepartDir = join(configDir, 'remote-encrypted-filepart');

    function notify(id, status) {
        if (notificationHandler) {
            notificationHandler(id, status);
        }
    }

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


    function doDownloaded(commitId: CommitId, a: RemotePendingCommitStatRecordDecided): Promise<RemotePendingCommitStatRecordDecided> {
        // TODO: Yeh Yeh, it's a Christmas tree... do something about it!
        if (!a.proceed) {
            notify(a.path, 'Skipping');
            return Promise.resolve(a);
        }
        notify(a.path, 'Downloading');
        let finalFilename = constructFilepartLocalLocation(
            configDir,
            a.gpgKey,
            commitId,
            a
        );
        return new Promise((resolve, reject) => {
            mkdirp(tmpDir, (e) => {
                if (e) { return reject(e); }
                mkdirp(dirname(finalFilename), (e) => {
                    if (e) { return reject(e); }
                    download(
                        tmpDir,
                        constructFilepartS3Location(s3Bucket, a.gpgKey, a),
                        finalFilename,
                        (e, r) => {
                            if (e) { return reject(e); }
                            notify(a.path, 'Downloaded');
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
            a.part,
            a.filePartByteCountThreshold,
            a.gpgKey
        );
    }

    function checkDownloaded(a: RemotePendingCommitStatRecordDecided): Promise<RemotePendingCommitStatRecordDecided> {
        // TODO: Derive arg for pDonwloadSize from Driver

        notify(a.path, 'Analyzing');
        if (!a.proceed) return Promise.resolve(a);
        return Promise.all([
            pMyStat(join(filepartDir, constructFilepart(a))),
            pDownloadSize(
                constructFilepartS3Location(s3Bucket, a.gpgKey, a)
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
        let ff = throat(1, f);
        return function(inputs: RemotePendingCommitStatRecordDecided[]) {
            return Promise.all(
                map(ff, inputs)
            );
        };
    }

    function process(commitId: CommitId, a: RemotePendingCommitStatRecordDecided, next: Callback<RemotePendingCommitStatRecordDecided>) {
        spawnPartsIfLast(a)
            .then(multi(checkDownloaded.bind(null)))
            .then(multi(doDownloaded.bind(null, commitId)))
            .then((aa: RemotePendingCommitStatRecordDecided[]) => {
                next(null, a);
            })
            .catch((e) => { next(e); });
    }

    return function(input: RemotePendingCommitStat, next) {
        mapLimit(
            input.record.filter(r => r.operation == Operation.Create),
            1,
            process.bind(null, input.commitId),
            (e: Error|null) => { next(e, input); }
        );
    };
}

