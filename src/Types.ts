import { ExitStatus, CmdOutput } from './CmdRunner';

export interface Callback<R> {
    (e: Error|null|undefined, r?: R): void;
}

export interface Callback2<R> {
    (e: Error|null|undefined, r: R): void;
}

export enum UserErrorCode {
    BLOCKED_BY_FILE = 1,
    FILE_MODIFIED_BEFORE_LOCAL_COMMIT = 2,
    FILE_MODIFIED_AFTER_LOCAL_COMMIT_BUT_NO_SHA256 = 3,
}


export class UserError extends Error {
   constructor(message: string, public code: UserErrorCode) {
       super(message);
   }
}

export type AbsoluteFilePath = string;

/**
 * The location of a repository stored on the local filesystem
 */
export type LocalRepositoryDirectoryPath = AbsoluteDirectoryPath;

export type AbsoluteDirectoryPath = string;

export type RelativeFilePath = string;

export type Sha256 = string;

export type ByteCount = number;

export type IsLast = boolean;

/**
 * A Commit is a group of uploads
 */
export type CommitId = string;

/**
 * A series of uploads (Sha256FilePart) and processed once a threshold (uploaded
 * file size / file count / time) is reached by grouping them into a Commit.
 */
export interface Commit {
    readonly record: BackupRecord[];
    readonly createdAt: Date;
    readonly commitId: CommitId;
    readonly clientId: ClientId;
}

/**
 * After all the Sha256FilePart are uploaded a commit file is wrote and the
 * Commit becomes Comitted.
 */
export interface Committed extends Commit {
    readonly relativeFilePath: RelativeFilePath;
}

/**
 * Once all the Sha256FilePart are uploaded and the file is written the Commit
 * file itself is uploaded also. Once it reaches this stage it becomes a
 * UploadedCommitted.
 */
export interface UploadedCommitted extends Committed {
    readonly result: CmdResult;
}

/**
 * A CommitFile is a Commit (file) that is from the current ClientId.
 *
 * As Commit files are only wrote after all Sha256FilePart are uploaded we know
 * that it must be 100% complete.
 */
export interface CommitFile extends File {
}

/**
 * A RemotePendingCommitFile is a Commit from another Client which we have
 * the Commit file itself for but have not decided anything about it (it is not
 * yet merged and we don't know when to merge it).
 *
 * If you want to distinguish between a RemotePendingCommitFile and a
 * Commit you should just see if the ClientId (from the filename) is the current
 * ClientId.
 */
export interface RemotePendingCommitFile extends CommitFile {
}

/**
 * A Client uniquely indentifies any computer that has uploaded of data.
 */
export type ClientId = string;

/**
 * The upload of a part of a file
 */
export interface BackupRecord { // Rename CommitRecord
    readonly sha256: Sha256;
    readonly operation: Operation;
    readonly fileByteCount: ByteCount;
    readonly modifiedDate: Date;
    readonly path: RelativeFilePath;
    readonly part: FilePartIndex;
}



/**
 * An operation that has occured upon a file
 */
export enum Operation {
    Create = 1,
    // Modify = 2, // I am not sure that this is a thing yet... enum reserved
    //             // incase it becomes so (as I like nice sequential numbers!
    Delete = 3
}

/**
 * number of bytes to skip, compatible with dd bs=___, for example 1, 1M or 1G
 */
export type DdBs = string|number;

/**
 * The name of a command to run, which should live in ./bash/ of this project.
 */
export type CommandName = string;

/**
 * name of an S3 Bucket, without the s3://
 */
export type S3BucketName = string;

/**
 * S3 Object name, without the s3:// or bucket name, may include "directory"
 */
export type S3Object = string;

export type S3Location = [S3BucketName, S3Object];

/**
 * The name of the GPG key
 */
export type GpgKey = string;

export type ByteOffset = number;

export type ModifiedDate = Date;

export type RemoteUri = string;

/**
 * The part number of the file, 1 based, followed by the total number of parts
 */
export type FilePartIndex = [number, number];

/**
 * The part number of the file, 1 based, padded by zeros so the length
 * of the string is always the same.
 */
export type FilePart = string;

export interface Filename { path: RelativeFilePath; }

export interface CommitType  { commitType: string; }

export type CommitFilename = Filename & CommitType;

/**
 * Represents a commit which has not been applied locally
 */
export interface RemotePendingCommitFilename extends Filename {}

export interface File extends Filename {
    readonly fileByteCount: ByteCount;
    readonly modifiedDate: Date;
}

export interface Sha256File extends File { sha256: Sha256; }

export interface Sha256FilePart extends Sha256File {
    readonly offset: number;
    readonly length: number;
    readonly isLast: boolean;
    readonly part: FilePartIndex;
}

export interface CmdResult { readonly exitStatus: ExitStatus; readonly output: CmdOutput[]; }

export interface UploadedS3FilePart extends Sha256FilePart { readonly result: CmdResult; }

export const BASE_TLID_TIMESTAMP = new Date('2017-07-22T08:54:05.274Z').getTime();
export const BASE_TLID_UNIQUENESS = 3;

export interface BackupCheckDatabaseValue { sha256: Sha256; fileByteCount: ByteCount; modifiedDate: Date; }
export interface BackupCheckDatabase {
    [k: string /* RelativeFilePath */]: BackupCheckDatabaseValue;
}

export interface ConfigFile {
    local: AbsoluteDirectoryPath;
    remote: S3BucketName;
    'client-id': ClientId;
    'gpg-encryption-key': GpgKey;
}

export interface RemotePendingCommit extends Commit {}

export interface RemotePendingCommitInfoRecord extends BackupRecord {
    readonly local: BackupCheckDatabaseValue|null;
}

export interface RemotePendingCommitInfo extends Commit {
    readonly record: RemotePendingCommitInfoRecord[];
}

export interface RemotePendingCommitStatRecordStat { sha256?: Sha256; fileByteCount: ByteCount; modifiedDate: Date; }

export interface RemotePendingCommitStatRecord extends RemotePendingCommitInfoRecord {
    readonly stat: null|RemotePendingCommitStatRecordStat;
}

export interface RemotePendingCommitStat extends RemotePendingCommitInfo {
    readonly record: RemotePendingCommitStatRecord[];
}

export interface RemotePendingCommitStatRecordDecided extends RemotePendingCommitStatRecord {
    proceed: boolean;
}

export interface RemotePendingCommitStatDecided extends RemotePendingCommitStat {
    readonly record: RemotePendingCommitStatRecordDecided[];
}

export interface RemotePendingCommitDownloaded extends RemotePendingCommitStatDecided {}

