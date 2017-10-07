import { Sha256, FilePart, AbsoluteFilePath, AbsoluteDirectoryPath, GpgKey, Sha256FilePart, DdBs, S3BucketName, CommandName, UploadedS3FilePart } from  './Types';
import { MapFunc } from 'streamdash';
import { join } from 'path';
import { ExitStatus, CmdOutput, CmdSpawner, CmdRunner } from './CmdRunner';
import { streamDataCollector } from 'streamdash';
import { assoc } from 'ramda';
import padLeadingZero from './padLeadingZero';

// TODO: Ensure we generate good bs= flags for `dd`... bs=1k/1M at least.
// TODO: Ensure in outer program that S3BucketName does not include s3://




/**
 * The environment to pass when executing the command to segment, encrypt and
 * upload to S3
 */
export interface Sha256FilePartUploadS3Environment {
    OPT_SHA: Sha256;
    OPT_PART: FilePart;
    OPT_DD_SKIP: number;
    OPT_DD_BS: DdBs;
    OPT_DD_COUNT: number;
    OPT_DD_FILENAME: AbsoluteFilePath;
    OPT_IS_LAST: number;
    OPT_GPG_KEY: GpgKey;
    OPT_S3_BUCKET: S3BucketName;
}

export interface MapFuncWithGetEnv<I, O> extends MapFunc<I, O> {
    getEnv(a: Sha256FilePart): Sha256FilePartUploadS3Environment;
}

export default function getSha256FilePartToUploadedS3FilePartMapFunc(rootPath: AbsoluteDirectoryPath, s3Bucket: S3BucketName, gpgKey: GpgKey, cmd: CommandName): MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart> {

    let cmdSpawner: CmdSpawner = CmdRunner.getCmdSpawner();

    function getEnv(a: Sha256FilePart): Sha256FilePartUploadS3Environment {

        return {
            OPT_SHA: a.sha256,
            OPT_PART: padLeadingZero(("" + a.part[1]).length, a.part[0]),
            OPT_DD_SKIP: a.offset,
            OPT_DD_BS: 1,
            OPT_DD_COUNT: a.length,
            OPT_DD_FILENAME: join(rootPath, a.path),
            OPT_IS_LAST: a.part[0] == a.part[1] ? 1 : 0,
            OPT_GPG_KEY: gpgKey,
            OPT_S3_BUCKET: s3Bucket
        };

    }

    let ret: MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart> | MapFunc<Sha256FilePart, UploadedS3FilePart> = (a: Sha256FilePart, cb) => {

        let cmdRunner = new CmdRunner(
            { cmdSpawner: cmdSpawner },
            Object.assign({}, process.env, getEnv(a)),
            ".",
            cmd,
            [],
            {}
        );
        let sdc = streamDataCollector(cmdRunner)
            .then((lines) => {
                cb(null, assoc('result', { exitStatus: 0, output: lines }, a));
            })
            .catch((err) => {
                cb(err); // TODO: What do we need to do here to make sure that
                         // errors are readable by an end user?
            });
    };

    (<MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart>>ret).getEnv = getEnv;

    return <MapFuncWithGetEnv<Sha256FilePart, UploadedS3FilePart>>ret;
}
