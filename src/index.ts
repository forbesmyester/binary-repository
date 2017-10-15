import { realpathSync, existsSync, writeFileSync } from 'fs';
import * as yargs from 'yargs';
import { join } from 'path';
import * as mkdirp from 'mkdirp';
import { pathOr } from 'ramda';
import * as getTlidEncoderDecoder from 'get_tlid_encoder_decoder';
import { ConfigFile, BASE_TLID_TIMESTAMP } from './Types';
import { commit, download, fetch, push } from './process';

let tLIdEncoderDecoder = getTlidEncoderDecoder(BASE_TLID_TIMESTAMP, 1);

function getTlId() { return tLIdEncoderDecoder.encode(); }

function validateEbakConfigurationPath(path) {
    return existsSync(path);
}

function resolve(opts) {
    let {_: [command], local, 'local-configuration': lc, 'filepart-gpg-encryption-key': fpGpgKey, 'gpg-encryption-key': gpgKey} = opts;

    let path: string = local;
    if (!validateEbakConfigurationPath(path)) {
        throw new Error("'local' does not exist or is not initialized");
    }

    lc = lc ? lc : join(local, '.ebak');
    if (!validateEbakConfigurationPath(path)) {
        throw new Error("'local-configuration' does not exist or is not initialized");
    }

    return {
        command,
        local,
        'local-configuration': lc
    };
}

yargs.usage('$0 <cmd> [args]')
    .option('local-config', {
        describe: "Use a configuration directory different to [local].ebak",
        alias: "local-configuration"
    })
    .option('filepart-gpg-encryption-key', {
        describe: 'Will use this key to encrypt FilePart (the actual data) as apposed to `gpg-encryption-key`',
    })
    .command(
        'init [client-id] [gpg-encryption-key] [local] [remote]', 'Initalizes',
        {
            'client-id': {
                require: true,
                describe: 'The directory you wish to push (upload)',
                type: 'string'
            },
            local: {
                require: true,
                describe: 'The directory you wish to push (upload)',
                type: 'string'
            },
            'gpg-encryption-key': {
                required: false,
                describe: 'The encryption key to use for Commit files',
                type: 'string'
            },
            remote: {
                require: true,
                describe: 'The destination you wish to push (upload)',
                type: 'string'
            },
        },
        function init({ local, remote, 'client-id': clientId, 'filepart-gpg-encryption-key': fpGpgKey, 'gpg-encryption-key': gpgKey, 'local-configuration': lc}) {
            let p = lc ? lc : join(local, '.ebak');

            if (existsSync(p)) {
                console.info(`FATAL ERROR: path '${p}' already exists`);
                process.exit(1);
            }

            fpGpgKey = fpGpgKey ? fpGpgKey : gpgKey;

            mkdirp(p, (err) => {

                if (err) {
                    console.info(`FATAL ERROR: path '${p}' could not be created`);
                    process.exit(1);
                }

                let cfg: ConfigFile = {
                    local,
                    remote,
                    'client-id': clientId,
                    'gpg-encryption-key': gpgKey,
                    'filepart-gpg-encryption-key': fpGpgKey
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
        'commit [local]', 'Syncronize local data to remote',
        {
            local: {
                require: true,
                describe: 'The directory you wish to commit',
                type: 'string'
            },
        },
        function (args) {
            let { local, 'local-configuration': localConfiguration } = resolve(args);
            commit(local, localConfiguration);
        }
    )
    .command(
        'push [local]', 'Syncronize local data to remote',
        {
            local: {
                require: true,
                describe: 'The repository you wish to pus (upload)',
                type: 'string'
            },
        },
        function (args) {
            let { local, 'local-configuration': localConfiguration } = resolve(args);
            push(local, localConfiguration);
        }
    )
    .command(
        'fetch [local]', 'Syncronize with remote data',
        {
            local: {
                require: true,
                describe: 'Fetches commit files from the remote so they can be downloaded',
                type: 'string'
            },
        },
        function (args) {
            let { local, 'local-configuration': localConfiguration } = resolve(args);
            fetch(local, localConfiguration);
        }
    )
    .command(
        'download [local]', 'Download remote data',
        {
            local: {
                require: true,
                describe: 'Fetches commit files from the remote so they can be downloaded',
                type: 'string'
            },
        },
        function (args) {
            let { local, 'local-configuration': localConfiguration } = resolve(args);
            download(local, localConfiguration);
        }
    )
    .demandCommand(1, "You must specify a command")
    .check(o => resolve(o))
    .strict()
    .help()
    .argv;


