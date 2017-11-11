import { BASE_TLID_TIMESTAMP, BASE_TLID_UNIQUENESS, FilePartIndex, Sha256, ClientId, CommitId, RemotePendingCommitStatRecordDecided, GpgKey, Callback, AbsoluteDirectoryPath, AbsoluteFilePath } from './Types';
import { CmdRunner } from './CmdRunner';
import { dirname, join } from 'path';
import * as filesize from 'filesize';
import { streamDataCollector } from 'streamdash';
import padLeadingZero from './padLeadingZero';
import * as getTlIdEncoderDecoder from 'get_tlid_encoder_decoder';


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

function constructFilepartFilename(sha256: Sha256, filePartIndex: FilePartIndex, filePartByteCountThreshold: number, gpgKey: GpgKey): string {
    return 'f-' + sha256 + '-' +
                padLeadingZero(("" + filePartIndex[1]).length, filePartIndex[0]) + '-' +
                filesize(filePartByteCountThreshold, { spacer: '' }) + '-' +
                gpgKey.replace(/\-/g, '--') +
                '.ebak';
}

class NotCommitFileError extends Error {}

let tlIdEncoderDecoder = getTlIdEncoderDecoder(BASE_TLID_TIMESTAMP, BASE_TLID_UNIQUENESS);

export default {
    constructFilepartFilename,
    constructFilepartLocalLocation: (configDir: AbsoluteDirectoryPath, gpgKey: GpgKey, commitId: CommitId, rec: RemotePendingCommitStatRecordDecided): AbsoluteFilePath => {
        return join(
            join(configDir, 'remote-encrypted-filepart'),
            `c-${commitId}-` + constructFilepartFilename(
                rec.sha256,
                rec.part,
                rec.filePartByteCountThreshold,
                gpgKey
            )
        );
    },
    infoFromCommitFilename(filename: AbsoluteFilePath) {
        let filenameRe = /\/*c\-([^\/\-]+)\-([^\/]+)\.commit$/;
        let filenameMatch = filename.match(filenameRe);

        if (!filenameMatch) {
            throw new NotCommitFileError(
                `The filename '${filename}' does not look like a commit file`
            );
        }

        let gpgKeyAndClientSeperatorMatch = filenameMatch[2].match(/[^\-]\-[^\-]/);

        if (gpgKeyAndClientSeperatorMatch === null) {
            throw new NotCommitFileError(
                `The filename '${filename}' does not look like a commit file`
            );
        }

        if (gpgKeyAndClientSeperatorMatch === undefined) {
            throw new NotCommitFileError(
                `The filename '${filename}' does not look like a commit file`
            );
        }

        let seperatorIndex = <number>gpgKeyAndClientSeperatorMatch.index + 1;
        let gpgKey = filenameMatch[2].substr(0, seperatorIndex);
        let clientId = filenameMatch[2].substr(seperatorIndex + 1);

        return {
            createdAt: new Date(tlIdEncoderDecoder.decode(filenameMatch[1])),
            commitId: filenameMatch[1],
            clientId: clientId.replace(/--/g, '-'),
            gpgKey: gpgKey.replace(/--/g, '-')
        };
    },
    constructCommitFilename: (commitId: CommitId, commitGpgKey: GpgKey, clientId: ClientId) => {
        let r = s => s.replace(/\-/g, '--');
        return `c-${commitId}-${r(commitGpgKey)}-${r(clientId)}.commit`;
    },
    decrypt: (gpgKey: GpgKey, tmpfile: AbsoluteFilePath, src: AbsoluteFilePath, dst: AbsoluteFilePath, next: Callback<void>): void => {

        let cmdSpawner = CmdRunner.getCmdSpawner();

            console.log(join(getBashRoot(__dirname), 'decrypt'));
        let cmdRunner = new CmdRunner(
            { cmdSpawner },
            Object.assign({}, process.env, getEnv(gpgKey, src, dst)),
            ".",
            join(getBashRoot(__dirname), 'decrypt'),
            [],
            {}
        );

        streamDataCollector(cmdRunner)
            .then((lines) => {
                next(null);
            })
            .catch((err) => {
                next(err);
            });

    }
}
