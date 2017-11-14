import { S3Location, RemoteType, CommitFilename, Callback, AbsoluteFilePath, AbsoluteDirectoryPath, GpgKey, S3BucketName, CommandName } from  './Types';
import { merge } from 'ramda';
import { dirname, join } from 'path';
import { waterfall } from 'async';
import { CmdSpawner, CmdRunner } from './CmdRunner';
import { unlink, rename } from 'fs';
import RepositoryLocalfiles from './repository/RepositoryLocalfiles';
import RepositoryS3 from './repository/RepositoryS3';
import { MapFunc, streamDataCollector } from 'streamdash';
import * as mkdirp from 'mkdirp';


const bashDir = join(dirname(dirname(__dirname)), 'bash');


export interface MkdirP {
    (path: AbsoluteDirectoryPath, next: (e: Error|null) => void): void;
}

/**
 * The environment to pass when executing the command to segment, encrypt and
 * upload to S3
 */
export interface Dependencies {
    unlink: (path: AbsoluteFilePath, next: Callback<void>) => void;
    cmdSpawner: CmdSpawner;
    rename: (src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>) => void;
    mkdirp: MkdirP;
    upload: (tmpDir: AbsoluteDirectoryPath, src: AbsoluteFilePath, loc: S3Location, next: Callback<void>) => void;
}

export function getDependencies(rt: RemoteType): Dependencies {

    let d = {
        unlink, rename, mkdirp, cmdSpawner: CmdRunner.getCmdSpawner({})
    };

    if (rt == RemoteType.S3) {
        return merge(d, {
            upload: RepositoryS3.upload
        });
    }

    if (rt == RemoteType.LOCAL_FILES) {
        return merge(d, {
            upload: RepositoryLocalfiles.upload
        });
    }

    throw new Error("Unsupported");
}


interface UploadS3Environment {
    OPT_SRC: string;
    OPT_DD_BS: string;
    OPT_DD_SKIP: string;
    OPT_DD_IS_LAST: string;
    OPT_GPG_KEY: string;
    OPT_DST: string;
}

export interface R {
    (dependencies: Dependencies): MapFunc<CommitFilename, CommitFilename>;
    getDependencies: (rt: RemoteType) => Dependencies;
}


function getCommittedToUploadedCommittedMapFunc(
    { unlink, mkdirp, upload, rename, cmdSpawner }: Dependencies,
    configDir: AbsoluteDirectoryPath,
    s3Bucket: S3BucketName,
    gpgKey: GpgKey,
    cmd: CommandName
    // TODO: Pass in CmdSpawner
) {


    function ensureDirsExists(next) {
        mkdirp(join(configDir, 'tmp'), (err) => {
            if (err) { return next(err); }
            mkdirp(join(configDir, 'commit'), (err) => {
                next(err);
            });
        });
    };


    function getEnv(a: CommitFilename): UploadS3Environment {
        return {
            OPT_GPG_KEY: gpgKey,
            OPT_DD_SKIP: '0',
            OPT_DD_BS: '1',
            OPT_DD_IS_LAST: '1',
            OPT_SRC: join(configDir, 'pending-commit', a.path),
            OPT_DST: join(configDir, 'tmp', a.path + '.enc')
        };
    }


    return function(a: CommitFilename, mainNext:  Callback<CommitFilename>) {

        let expectedLoc: S3Location = [s3Bucket, a.path];
        let env = getEnv(a);

        function encryptFilePartToTmp(next) {

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


        function uploadEncrytpedPart(next) {
            upload(
                join(configDir, 'tmp'),
                env.OPT_DST,
                expectedLoc,
                (e) => { next(e); }
            );
        };

        function moveCommit(next) {
            rename(
                join(configDir, 'pending-commit', a.path),
                join(configDir, 'commit', a.path),
                e => { next(e); }
            );
        }

        let removeTmp = (next) => {
            unlink(env.OPT_DST, (e) => { next(e); });
        };

        let stages = [
            ensureDirsExists,
            encryptFilePartToTmp,
            uploadEncrytpedPart,
            moveCommit,
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

}

let x = Object.assign(getCommittedToUploadedCommittedMapFunc, { getDependencies });
export default x;


