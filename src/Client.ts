import { FilePartIndex, Sha256, RemotePendingCommitStatRecordDecided, GpgKey, Callback, AbsoluteDirectoryPath, AbsoluteFilePath } from './Types';
import { ExitStatus, CmdOutput, CmdSpawner, CmdRunner } from './CmdRunner';
import { dirname, join } from 'path';
import { streamDataCollector } from 'streamdash';
import padLeadingZero from './padLeadingZero';


function getEnv(gpgKey: GpgKey, src: AbsoluteFilePath, dst: AbsoluteFilePath) {

    return {
        OPT_SRC: src,
        OPT_DST: dst,
        OPT_GPG_KEY: gpgKey,
    };

}

function getBashRoot(d: AbsoluteFilePath): AbsoluteDirectoryPath {
    return join(dirname(dirname(d)), 'bash');
}

function constructFilepartFilename(sha256: Sha256, filePartIndex: FilePartIndex): string {
    let p = padLeadingZero(("" + filePartIndex[1]).length, filePartIndex[0]);
    return `f-${sha256}-${p}.ebak`
}

export default {
    constructFilepartFilename,
    constructFilepartLocalLocation: (configDir: AbsoluteDirectoryPath, maxFilepart: number, rec: RemotePendingCommitStatRecordDecided): AbsoluteFilePath => {
        return join(
            join(configDir, 'remote-encrypted-filepart'),
            constructFilepartFilename(
                rec.sha256,
                rec.part
            )
        );
    },
    decrypt: (gpgKey: GpgKey, tmpfile: AbsoluteFilePath, src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>): void => {

        let cmdSpawner = CmdRunner.getCmdSpawner();

        let cmdRunner = new CmdRunner(
            { cmdSpawner },
            Object.assign({}, process.env, getEnv(gpgKey, src, dst)),
            ".",
            join(getBashRoot(__dirname), 'decrypt'),
            [],
            {}
        );

        let sdc = streamDataCollector(cmdRunner)
            .then((lines) => {
                next(null);
            })
            .catch((err) => {
                next(err);
            });

    }
}
