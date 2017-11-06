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
function getToDownloadedParts({ constructFilepartLocalLocation, constructFilepartS3Location, mkdirp, stat, downloadSize, download }, configDir, s3Bucket, notificationHandler) {
    let tmpDir = path_1.join(configDir, 'tmp'), filepartDir = path_1.join(configDir, 'remote-encrypted-filepart');
    function notify(id, status) {
        if (notificationHandler) {
            notificationHandler(id, status);
        }
    }
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
        if (!a.proceed) {
            notify(a.path, 'Skipping');
            return Promise.resolve(a);
        }
        notify(a.path, 'Downloading');
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
                        notify(a.path, 'Downloaded');
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
        notify(a.path, 'Analyzing');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9Eb3dubG9hZGVkUGFydHNNYXBGdW5jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dldFRvRG93bmxvYWRlZFBhcnRzTWFwRnVuYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUErQjtBQUMvQixxQ0FBOEI7QUFDOUIsMkJBQXlGO0FBQ3pGLGlDQUFpQztBQUNqQywrQkFBNEI7QUFFNUIsaUNBQWtDO0FBQ2xDLGlDQUFpRTtBQUNqRSxtQ0FBa1A7QUFDbFAsaUNBQWlDO0FBQ2pDLDRFQUFxRTtBQUNyRSw0REFBcUQ7QUFlckQseUJBQWdDLElBQWdCO0lBRTVDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxrQkFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEIsTUFBTSxDQUFDO1lBQ0gsTUFBTTtZQUNOLElBQUksRUFBRSxTQUFRO1lBQ2QsUUFBUSxFQUFFLHNCQUFZLENBQUMsUUFBUTtZQUMvQixZQUFZLEVBQUUsc0JBQVksQ0FBQyxZQUFZO1lBQ3ZDLDJCQUEyQixFQUFFLHNCQUFZLENBQUMsMkJBQTJCO1lBQ3JFLDhCQUE4QixFQUFFLGdCQUFNLENBQUMsOEJBQThCO1NBQ3hFLENBQUM7SUFDTixDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLGtCQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUM7WUFDSCxNQUFNO1lBQ04sSUFBSSxFQUFFLFNBQVE7WUFDZCxRQUFRLEVBQUUsOEJBQW9CLENBQUMsUUFBUTtZQUN2QyxZQUFZLEVBQUUsOEJBQW9CLENBQUMsWUFBWTtZQUMvQywyQkFBMkIsRUFBRSw4QkFBb0IsQ0FBQywyQkFBMkI7WUFDN0UsOEJBQThCLEVBQUUsZ0JBQU0sQ0FBQyw4QkFBOEI7U0FDeEUsQ0FBQztJQUNOLENBQUM7SUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRW5DLENBQUM7QUExQkQsMENB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