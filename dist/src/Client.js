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
    constructFilepartLocalLocation: (configDir, gpgKey, commitId, rec) => {
        return path_1.join(path_1.join(configDir, 'remote-encrypted-filepart'), `c-${commitId}-` + constructFilepartFilename(rec.sha256, rec.part, rec.filePartByteCountThreshold, gpgKey));
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