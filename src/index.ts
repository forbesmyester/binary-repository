import { realpathSync, existsSync, writeFileSync } from 'fs';
import * as yargs from 'yargs';
import { join } from 'path';
import * as mkdirp from 'mkdirp';
import { pathOr } from 'ramda';
import * as getTlidEncoderDecoder from 'get_tlid_encoder_decoder';
import { ConfigFile, BASE_TLID_TIMESTAMP } from './Types';
import { upload } from './process';

let tLIdEncoderDecoder = getTlidEncoderDecoder(BASE_TLID_TIMESTAMP, 1);

function getTlId() { return tLIdEncoderDecoder.encode(); }

function validateEbakConfigurationPath(path) {
    return existsSync(path);
}

function resolve(opts) {
    let {_: [command], local, 'local-configuration': lc} = opts;

    let path: string = local;
    if (!validateEbakConfigurationPath(path)) {
        throw new Error("'local' does not exist or is not initialized");
    }

    lc = lc ? lc : join(local, '.ebak');
    if (!validateEbakConfigurationPath(path)) {
        throw new Error("'local-configuration' does not exist or is not initialized");
    }

    return {command, local, 'localConfiguration': lc};
}

yargs.usage('$0 <cmd> [args]')
    .command(
        'init [client-id] [local] [gpg-encryption-key] [remote]', 'Initalizes',
        {
            local: {
                require: true,
                describe: 'The directory you wish to upload',
                type: 'string'
            },
            'client-id': {
                required: true,
                describe: 'This will identify [local] when synchronizing',
                type: 'string'
            },
            'gpg-encryption-key': {
                require: true,
                describe: 'The encryption key to use',
                type: 'string'
            },
            remote: {
                require: true,
                describe: 'The destination you wish to upload to (s3)',
                type: 'string'
            },
        },
        function init({ local, remote, 'client-id': client, 'gpg-encryption-key': gpgKey, 'local-configuration': lc}) {
            let p = lc ? lc : join(local, '.ebak');

            if (existsSync(p)) {
                console.info(`FATAL ERROR: path '${p}' already exists`);
                process.exit(1);
            }

            mkdirp(p, (err) => {

                if (err) {
                    console.info(`FATAL ERROR: path '${p}' could not be created`);
                    process.exit(1);
                }

                let cfg: ConfigFile = {
                    local,
                    remote,
                    'client-id': client,
                    'gpg-encryption-key': gpgKey
                };

                let file = join(p, 'config');

                writeFileSync(
                    file,
                    JSON.stringify(cfg),
                    { encoding: 'utf8' }
                );
                console.log(`SUCCESS: path '${local}' has been initialized with ` +
                    `config stored in ${file}`);
            });
        }
    )
    .command(
        'upload [local]', 'Syncronize local data to remote',
        {
            local: {
                require: true,
                describe: 'The directory you wish to upload',
                type: 'string'
            },
        },
        function (args) {
            let { local, localConfiguration } = resolve(args);
            upload(local, localConfiguration);
        }
    )
    .option('force-sha1', {
        describe: "Check for backup status based on SHA1 also (as well as File Size and Modification Date)",
    })
    .option('local-config', {
        describe: "Use a configuration directory different to [local].ebak",
        alias: "local-configuration"
    })
    .demandCommand(1, "You must specify a command")
    .check(o => resolve(o))
    .strict()
    .help()
    .argv;


