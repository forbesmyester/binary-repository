import { RemoteType, S3Location, Callback, AbsoluteFilePath, AbsoluteDirectoryPath, GpgKey, Sha256FilePart, S3BucketName, UploadedS3FilePart } from  './Types';
import Client from './Client';
import { waterfall } from 'async'
import { MapFunc } from 'streamdash';
import { dirname, join } from 'path';
import * as mkdirp from 'mkdirp';
import { CmdSpawner, CmdRunner } from './CmdRunner';
import { unlink } from 'fs';
import { streamDataCollector } from 'streamdash';
import { merge } from 'ramda';
import RepositoryLocalfiles from './repository/RepositoryLocalfiles';
import RepositoryS3 from './repository/RepositoryS3';


export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}


const bashDir = join(dirname(dirname(__dirname)), 'bash');


/**
 * The environment to pass when executing the command to segment, encrypt and
 * upload to S3
 */
export interface Sha256FilePartEncryptEnvironment {
    OPT_SRC: string;
    OPT_DD_BS: string;
    OPT_DD_SKIP: string;
    OPT_DD_COUNT: string,
    OPT_DD_IS_LAST: string,
    OPT_GPG_KEY: string;
    OPT_DST: string;
}


export interface MapFuncWithGetEnv<I, O> extends MapFunc<I, O> {
    getEnv(filePartByteCountThreshold: number, a: Sha256FilePart): Sha256FilePartEncryptEnvironment;
}


export interface Dependencies {
    unlink: (path: AbsoluteFilePath, next: Callback<void>) => void;
    cmdSpawner: CmdSpawner;
    exists: (loc: S3Location, next: Callback<boolean>) => void;
    upload: (tmpDir: AbsoluteDirectoryPath, src: AbsoluteFilePath, loc: S3Location, next: Callback<void>) => void;
    mkdirp: MkdirP;
}


export function getDependencies(rt: RemoteType): Dependencies {

    let d = {
        cmdSpawner: CmdRunner.getCmdSpawner(),
        unlink,
        mkdirp
    };

    if (rt == RemoteType.S3) {
        return merge(d, {
            exists: RepositoryS3.exists,
            upload: RepositoryS3.upload
        });
    }

    if (rt == RemoteType.LOCAL_FILES) {
        return merge(d, {
            exists: RepositoryLocalfiles.exists,
            upload: RepositoryLocalfiles.upload
        });
    }

    throw new Error("Unsupported");
}

export default function getSha256FilePartToUploadedS3FilePartMapFunc({unlink, mkdirp, upload, cmdSpawner, exists}: Dependencies, configDir: AbsoluteDirectoryPath, rootPath: AbsoluteDirectoryPath, s3Bucket: S3BucketName, gpgKey: GpgKey, filePartByteCountThreshold: number): MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart> {

    function getEnv(filePartByteCountThreshold: number, a: Sha256FilePart): Sha256FilePartEncryptEnvironment {

        return {
            OPT_GPG_KEY: gpgKey,
            OPT_DD_SKIP: '' + a.offset,
            OPT_DD_BS: '1',
            OPT_DD_COUNT: "" + a.length,
            OPT_DD_IS_LAST: a.part[0] == a.part[1] ? '1' : '0',
            OPT_SRC: join(rootPath, a.path),
            OPT_DST: join(
                configDir,
                'tmp',
                Client.constructFilepartFilename(
                    a.sha256,
                    a.part,
                    filePartByteCountThreshold,
                    gpgKey
                ) + '.enc'
            )
        };

    }

    let ret: MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart> | MapFunc<Sha256FilePart, UploadedS3FilePart> = (a: Sha256FilePart, mainNext) => {

        let expectedLoc: S3Location = [
            s3Bucket,
            Client.constructFilepartFilename(
                a.sha256,
                a.part,
                filePartByteCountThreshold,
                gpgKey
            )
        ];

        let env = getEnv(filePartByteCountThreshold, a);

        let checkNotAlreadyUploaded = (next) => {
            exists(expectedLoc, (e, isThere) => {
                if (e) { return next(e); }
                if (isThere) {
                    return mainNext(
                        null,
                        merge({ gpgKey: gpgKey }, a)
                    );
                }
                next(null);
            });
        };

        let ensureTmpExists = (next) => {
            mkdirp(join(configDir, 'tmp'), (err) => { next(err); });
        };

        let encryptFilePartToTmp = (next) => {

            let cmdRunner = new CmdRunner(
                { cmdSpawner: cmdSpawner },
                Object.assign(
                    {},
                    <{[k :string]: string}>process.env,
                    env
                ),
                ".",
                join(bashDir, 'encrypt'),
                [],
                {}
            );

            streamDataCollector(cmdRunner)
                .then((lines) => { next(null); })
                .catch(next);

        }


        let uploadEncrytpedPart = (next) => {
            upload(
                join(configDir, 'tmp'),
                env.OPT_DST,
                expectedLoc,
                (e) => { next(e); }
            );
        };

        let removeTmp = (next) => {
            unlink(env.OPT_DST, (e) => { next(e); });
        };

        let stages = [
            checkNotAlreadyUploaded,
            ensureTmpExists,
            encryptFilePartToTmp,
            uploadEncrytpedPart,
            removeTmp
        ];

        waterfall(stages, (e: Error|null) => {
            if (e) { return mainNext(e); }
            mainNext(
                null,
                merge({ gpgKey: gpgKey }, a)
            );
        });
    };

    (<MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart>>ret).getEnv = getEnv;
    return <MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart>>ret;
}
