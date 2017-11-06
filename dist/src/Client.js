"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const CmdRunner_1 = require("./CmdRunner");
const path_1 = require("path");
const filesize = require("filesize");
const streamdash_1 = require("streamdash");
const padLeadingZero_1 = require("./padLeadingZero");
const getTlIdEncoderDecoder = require("get_tlid_encoder_decoder");
function getEnv(gpgKey, src, dst) {
    return {
        OPT_SRC: src,
        OPT_DST: dst,
        OPT_GPG_KEY: gpgKey,
    };
}
function getBashRoot(d) {
    return path_1.join(path_1.dirname(path_1.dirname(d)), 'bash');
}
function constructFilepartFilename(sha256, filePartIndex, filePartByteCountThreshold, gpgKey) {
    return 'f-' + sha256 + '-' +
        padLeadingZero_1.default(("" + filePartIndex[1]).length, filePartIndex[0]) + '-' +
        filesize(filePartByteCountThreshold, { spacer: '' }) + '-' +
        gpgKey.replace(/\-/g, '--') +
        '.ebak';
}
class NotCommitFileError extends Error {
}
let tlIdEncoderDecoder = getTlIdEncoderDecoder(Types_1.BASE_TLID_TIMESTAMP, Types_1.BASE_TLID_UNIQUENESS);
exports.default = {
    constructFilepartFilename,
    constructFilepartLocalLocation: (configDir, gpgKey, rec) => {
        return path_1.join(path_1.join(configDir, 'remote-encrypted-filepart'), constructFilepartFilename(rec.sha256, rec.part, rec.filePartByteCountThreshold, gpgKey));
    },
    infoFromCommitFilename(filename) {
        let filenameRe = /\/*c\-([^\/\-]+)\-([^\/]+)\.commit$/;
        let filenameMatch = filename.match(filenameRe);
        if (!filenameMatch) {
            throw new NotCommitFileError(`The filename '${filename}' does not look like a commit file`);
        }
        let gpgKeyAndClientSeperatorMatch = filenameMatch[2].match(/[^\-]\-[^\-]/);
        if (gpgKeyAndClientSeperatorMatch === null) {
            throw new NotCommitFileError(`The filename '${filename}' does not look like a commit file`);
        }
        if (gpgKeyAndClientSeperatorMatch === undefined) {
            throw new NotCommitFileError(`The filename '${filename}' does not look like a commit file`);
        }
        let seperatorIndex = gpgKeyAndClientSeperatorMatch.index + 1;
        let gpgKey = filenameMatch[2].substr(0, seperatorIndex);
        let clientId = filenameMatch[2].substr(seperatorIndex + 1);
        return {
            createdAt: new Date(tlIdEncoderDecoder.decode(filenameMatch[1])),
            commitId: filenameMatch[1],
            clientId: clientId.replace(/--/g, '-'),
            gpgKey: gpgKey.replace(/--/g, '-')
        };
    },
    constructCommitFilename: (commitId, commitGpgKey, clientId) => {
        let r = s => s.replace(/\-/g, '--');
        return `c-${commitId}-${r(commitGpgKey)}-${r(clientId)}.commit`;
    },
    decrypt: (gpgKey, tmpfile, src, dst, next) => {
        let cmdSpawner = CmdRunner_1.CmdRunner.getCmdSpawner();
        console.log(path_1.join(getBashRoot(__dirname), 'decrypt'));
        let cmdRunner = new CmdRunner_1.CmdRunner({ cmdSpawner }, Object.assign({}, process.env, getEnv(gpgKey, src, dst)), ".", path_1.join(getBashRoot(__dirname), 'decrypt'), [], {});
        let sdc = streamdash_1.streamDataCollector(cmdRunner)
            .then((lines) => {
            next(null);
        })
            .catch((err) => {
            next(err);
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFnTjtBQUNoTiwyQ0FBMkU7QUFDM0UsK0JBQXFDO0FBQ3JDLHFDQUFxQztBQUNyQywyQ0FBaUQ7QUFDakQscURBQThDO0FBQzlDLGtFQUFrRTtBQUdsRSxnQkFBZ0IsTUFBYyxFQUFFLEdBQXFCLEVBQUUsR0FBcUI7SUFFeEUsTUFBTSxDQUFDO1FBQ0gsT0FBTyxFQUFFLEdBQUc7UUFDWixPQUFPLEVBQUUsR0FBRztRQUNaLFdBQVcsRUFBRSxNQUFNO0tBQ3RCLENBQUM7QUFFTixDQUFDO0FBRUQscUJBQXFCLENBQW1CO0lBQ3BDLE1BQU0sQ0FBQyxXQUFJLENBQUMsY0FBTyxDQUFDLGNBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFFRCxtQ0FBbUMsTUFBYyxFQUFFLGFBQTRCLEVBQUUsMEJBQWtDLEVBQUUsTUFBYztJQUMvSCxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sR0FBRyxHQUFHO1FBQ2Qsd0JBQWMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRztRQUN0RSxRQUFRLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHO1FBQzFELE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQztRQUMzQixPQUFPLENBQUM7QUFDeEIsQ0FBQztBQUVELHdCQUF5QixTQUFRLEtBQUs7Q0FBRztBQUV6QyxJQUFJLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDLDJCQUFtQixFQUFFLDRCQUFvQixDQUFDLENBQUM7QUFFMUYsa0JBQWU7SUFDWCx5QkFBeUI7SUFD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