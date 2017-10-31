"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const myStats_1 = require("./myStats");
const Client_1 = require("./Client");
const fs_1 = require("fs");
const async_1 = require("async");
const path_1 = require("path");
const throat = require("throat");
const ramda_1 = require("ramda");
const Types_1 = require("./Types");
const mkdirp = require("mkdirp");
const RepositoryLocalfiles_1 = require("./repository/RepositoryLocalfiles");
const RepositoryS3_1 = require("./repository/RepositoryS3");
function getDependencies(mode) {
    if (mode == Types_1.RemoteType.S3) {
        return {
            mkdirp,
            stat: fs_1.stat,
            download: RepositoryS3_1.default.download,
            downloadSize: RepositoryS3_1.default.downloadSize,
            constructFilepartS3Location: RepositoryS3_1.default.constructFilepartS3Location,
            constructFilepartLocalLocation: Client_1.default.constructFilepartLocalLocation
        };
    }
    if (mode == Types_1.RemoteType.LOCAL_FILES) {
        return {
            mkdirp,
            stat: fs_1.stat,
            download: RepositoryLocalfiles_1.default.download,
            downloadSize: RepositoryLocalfiles_1.default.downloadSize,
            constructFilepartS3Location: RepositoryLocalfiles_1.default.constructFilepartS3Location,
            constructFilepartLocalLocation: Client_1.default.constructFilepartLocalLocation
        };
    }
    throw new Error("Unsupported");
}
exports.getDependencies = getDependencies;
function getToDownloadedParts({ constructFilepartLocalLocation, constructFilepartS3Location, mkdirp, stat, downloadSize, download }, configDir, s3Bucket) {
    let tmpDir = path_1.join(configDir, 'tmp'), filepartDir = path_1.join(configDir, 'remote-encrypted-filepart');
    function pDownloadSize(l) {
        return new Promise((resolve, reject) => {
            downloadSize(l, (e, r) => {
                if (e) {
                    return reject(e);
                }
                resolve(r);
            });
        });
    }
    function pMyStat(ap) {
        return new Promise((resolve, reject) => {
            myStats_1.default(stat, ap, (e, r) => {
                if (e) {
                    return reject(e);
                }
                resolve(r);
            });
        });
    }
    function doDownloaded(a) {
        // TODO: Yeh Yeh, it's a Christmas tree... do something about it!
        if (!a.proceed)
            return Promise.resolve(a);
        return new Promise((resolve, reject) => {
            mkdirp(tmpDir, (e) => {
                if (e) {
                    return reject(e);
                }
                mkdirp(filepartDir, (e) => {
                    if (e) {
                        return reject(e);
                    }
                    download(tmpDir, constructFilepartS3Location(s3Bucket, a.gpgKey, a), constructFilepartLocalLocation(configDir, a.gpgKey, a), (e, r) => {
                        if (e) {
                            return reject(e);
                        }
                        resolve(a);
                    });
                });
            });
        });
    }
    function constructFilepart(a) {
        return Client_1.default.constructFilepartFilename(a.sha256, a.part, a.filePartByteCountThreshold, a.gpgKey);
    }
    function checkDownloaded(a) {
        // TODO: Derive arg for pDonwloadSize from Driver
        if (!a.proceed)
            return Promise.resolve(a);
        return Promise.all([
            pMyStat(path_1.join(filepartDir, constructFilepart(a))),
            pDownloadSize(constructFilepartS3Location(s3Bucket, a.gpgKey, a))
        ]).then(([stats, downloadSize]) => {
            if (stats === null) {
                return a;
            }
            if (stats.size == downloadSize) {
                return ramda_1.assoc('proceed', false, a);
            }
            return a;
        });
    }
    function spawnPartsIfLast(a) {
        if (!a.proceed) {
            return Promise.resolve([a]);
        }
        let r = ramda_1.map(part0 => {
            return ramda_1.assoc('part', [part0, a.part[1]], a);
        }, ramda_1.range(1, a.part[1] + 1));
        return Promise.resolve(r);
    }
    function multi(f) {
        let ff = throat(3, f);
        return function (inputs) {
            return Promise.all(ramda_1.map(ff, inputs));
        };
    }
    function process(a, next) {
        let max = a.part[1];
        spawnPartsIfLast(a)
            .then(multi(checkDownloaded.bind(null)))
            .then(multi(doDownloaded.bind(null)))
            .then((aa) => {
            next(null, a);
        })
            .catch((e) => { next(e); });
    }
    return function (input, next) {
        async_1.mapLimit(input.record, 2, process, (e) => { next(e, input); });
    };
}
exports.default = getToDownloadedParts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9Eb3dubG9hZGVkUGFydHNNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldFRvRG93bmxvYWRlZFBhcnRzTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUErQjtBQUMvQixxQ0FBOEI7QUFDOUIsMkJBQXlGO0FBQ3pGLGlDQUFpQztBQUNqQywrQkFBNEI7QUFFNUIsaUNBQWtDO0FBQ2xDLGlDQUFpRTtBQUNqRSxtQ0FBNk47QUFDN04saUNBQWlDO0FBQ2pDLDRFQUFxRTtBQUNyRSw0REFBcUQ7QUFlckQseUJBQWdDLElBQWdCO0lBRTVDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxrQkFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEIsTUFBTSxDQUFDO1lBQ0gsTUFBTTtZQUNOLElBQUksRUFBRSxTQUFRO1lBQ2QsUUFBUSxFQUFFLHNCQUFZLENBQUMsUUFBUTtZQUMvQixZQUFZLEVBQUUsc0JBQVksQ0FBQyxZQUFZO1lBQ3ZDLDJCQUEyQixFQUFFLHNCQUFZLENBQUMsMkJBQTJCO1lBQ3JFLDhCQUE4QixFQUFFLGdCQUFNLENBQUMsOEJBQThCO1NBQ3hFLENBQUM7SUFDTixDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLGtCQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUM7WUFDSCxNQUFNO1lBQ04sSUFBSSxFQUFFLFNBQVE7WUFDZCxRQUFRLEVBQUUsOEJBQW9CLENBQUMsUUFBUTtZQUN2QyxZQUFZLEVBQUUsOEJBQW9CLENBQUMsWUFBWTtZQUMvQywyQkFBMkIsRUFBRSw4QkFBb0IsQ0FBQywyQkFBMkI7WUFDN0UsOEJBQThCLEVBQUUsZ0JBQU0sQ0FBQyw4QkFBOEI7U0FDeEUsQ0FBQztJQUNOLENBQUM7SUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRW5DLENBQUM7QUExQkQsMENB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