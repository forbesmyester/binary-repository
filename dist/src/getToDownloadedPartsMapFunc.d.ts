/// <reference types="node" />
import { Stats } from 'fs';
import { MapFunc } from 'streamdash';
import { CommitId, NotificationHandler, GpgKey, RemoteType, S3Location, RemotePendingCommitStatRecordDecided, AbsoluteFilePath, AbsoluteDirectoryPath, RemotePendingCommitStat, Callback, S3BucketName, ByteCount } from './Types';
export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error | null) => void): void;
}
export interface Dependencies {
    stat: (f: AbsoluteFilePath, cb: (err: null | NodeJS.ErrnoException, stats: Stats) => void) => void;
    download: (tmpDir: AbsoluteDirectoryPath, loc: S3Location, downloadTo: AbsoluteFilePath, next: Callback<void>) => void;
    downloadSize: (loc: S3Location, next: Callback<ByteCount>) => void;
    mkdirp: MkdirP;
    constructFilepartS3Location: (s3Bucket: S3BucketName, gpgKey: GpgKey, rec: RemotePendingCommitStatRecordDecided) => S3Location;
    constructFilepartLocalLocation: (configDir: AbsoluteDirectoryPath, gpgKey: GpgKey, commitId: CommitId, rec: RemotePendingCommitStatRecordDecided) => AbsoluteFilePath;
}
export declare function getDependencies(mode: RemoteType): Dependencies;
export default function getToDownloadedParts({constructFilepartLocalLocation, constructFilepartS3Location, mkdirp, stat, downloadSize, download}: Dependencies, configDir: AbsoluteDirectoryPath, s3Bucket: S3BucketName, notificationHandler?: NotificationHandler): MapFunc<RemotePendingCommitStat, RemotePendingCommitStat>;
