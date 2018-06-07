import { last, values, mapObjIndexed } from 'ramda';
import commitIdGenerator from './commitIdGenerator';
import { MapFunc } from 'streamdash';
import { BackupCheckDatabase, BackupCheckDatabaseValue, ConfigFile, RemotePendingCommitStat, Operation } from './Types';

function p(bcdv: BackupCheckDatabaseValue[], path) {
    return {
        gpgKey: last(bcdv).gpgKey,
        filePartByteCountThreshold: last(bcdv).filePartByteCountThreshold,
        sha256: last(bcdv).sha256,
        operation: Operation.Create,
        fileByteCount: -1,
        modifiedDate: last(bcdv).modifiedDate,
        path,
        part: last(bcdv).part,
        local: null,
        stat: null,
        proceed: true
    }
}

export default function getBackupCheckDatabaseToRemotePendingCommitStat(config: ConfigFile, dte: Date): MapFunc<BackupCheckDatabase, RemotePendingCommitStat> {

    return function(bcd: BackupCheckDatabase, next) {

        next(null, {
            clientId: config['client-id'],
            gpgKey: config['gpg-key'],
            createdAt: dte,
            commitId: commitIdGenerator(dte),
            record: values(mapObjIndexed(p, bcd))
        });

    }

}



