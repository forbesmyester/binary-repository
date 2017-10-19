import { S3Object, ClientId, FilePartIndex, RemoteType, S3Location, Callback, ByteCount, Sha256, FilePart, AbsoluteFilePath, AbsoluteDirectoryPath, GpgKey, Sha256FilePart, S3BucketName, CommandName, UploadedS3FilePart } from  './Types';
import Client from './Client';
import { MapFunc } from 'streamdash';
import { join } from 'path';
import { ExitStatus, CmdOutput, CmdSpawner, CmdRunner } from './CmdRunner';
import { streamDataCollector } from 'streamdash';
import { merge, assoc } from 'ramda';
import padLeadingZero from './padLeadingZero';
import RepositoryLocalfiles from './repository/RepositoryLocalfiles';
import RepositoryS3 from './repository/RepositoryS3';

// TODO: Ensure we generate good bs= flags for `dd`... bs=1k/1M at least.
// TODO: Ensure in outer program that S3BucketName does not include s3://




/**
 * The environment to pass when executing the command to segment, encrypt and
 * upload to S3
 */
export interface Sha256FilePartUploadS3Environment {
    OPT_DD_SKIP: number;
    OPT_DD_BS: number;
    OPT_DD_COUNT: number;
    OPT_DD_FILENAME: AbsoluteFilePath;
    OPT_IS_LAST: number;
    OPT_GPG_KEY: GpgKey;
    OPT_S3_BUCKET: S3BucketName;
    OPT_S3_OBJECT: S3Object;
}

export interface MapFuncWithGetEnv<I, O> extends MapFunc<I, O> {
    getEnv(filePartByteCountThreshold: number, a: Sha256FilePart): Sha256FilePartUploadS3Environment;
}

export interface Dependencies {
    cmdSpawner: CmdSpawner;
    exists: (loc: S3Location, next: Callback<boolean>) => void;
}

export function getDependencies(rt: RemoteType): Dependencies {

    let d = {
        cmdSpawner: CmdRunner.getCmdSpawner(),
    };

    if (rt == RemoteType.S3) {
        return assoc(
            'exists',
            RepositoryS3.exists,
            d
        );
    }

    if (rt == RemoteType.LOCAL_FILES) {
        return assoc(
            'exists',
            RepositoryLocalfiles.exists,
            d
        );
    }

    throw new Error("Unsupported");
}

export default function getSha256FilePartToUploadedS3FilePartMapFunc({cmdSpawner, exists}: Dependencies, rootPath: AbsoluteDirectoryPath, s3Bucket: S3BucketName, gpgKey: GpgKey, filePartByteCountThreshold: number, cmd: CommandName): MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart> {

    function getEnv(filePartByteCountThreshold: number, a: Sha256FilePart): Sha256FilePartUploadS3Environment {

        return {
            OPT_DD_SKIP: a.offset,
            OPT_DD_BS: 1,
            OPT_DD_COUNT: a.length,
            OPT_DD_FILENAME: join(rootPath, a.path),
            OPT_IS_LAST: a.part[0] == a.part[1] ? 1 : 0,
            OPT_GPG_KEY: gpgKey,
            OPT_S3_BUCKET: s3Bucket,
            OPT_S3_OBJECT: Client.constructFilepartFilename(
                a.sha256,
                a.part,
                filePartByteCountThreshold
            )
        };

    }

    let ret: MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart> | MapFunc<Sha256FilePart, UploadedS3FilePart> = (a: Sha256FilePart, cb) => {

        let expectedLoc: S3Location = [
            s3Bucket,
            Client.constructFilepartFilename(
                a.sha256,
                a.part,
                filePartByteCountThreshold
            )
        ];

        exists(expectedLoc, (e, isThere) => {
            if (e) { return cb(e); }

            if (isThere) {
                return cb(
                    null,
                    merge(
                        {
                            result: { exitStatus: 0, output: [] },
                            uploadAlreadyExists: true,
                            gpgKey: gpgKey
                        },
                        a
                    )
                );
            }

            let cmdRunner = new CmdRunner(
                { cmdSpawner: cmdSpawner },
                Object.assign({}, process.env, getEnv(filePartByteCountThreshold, a)),
                ".",
                cmd,
                [],
                {}
            );

            let sdc = streamDataCollector(cmdRunner)
                .then((lines) => {
                    cb(
                        null,
                        merge(
                            {
                                gpgKey: gpgKey,
                                result: {
                                    exitStatus: 0,
                                    output: lines
                                },
                                uploadAlreadyExists: false
                            },
                            a
                        )
                    );
                })
                .catch((err) => {
                    cb(err);
                });

        })

    };

    (<MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart>>ret).getEnv = getEnv;

    return <MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart>>ret;
}
