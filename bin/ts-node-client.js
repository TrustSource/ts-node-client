#!/usr/bin/env node

/* eslint-disable */
/**************************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG GmbH
 *
 * SPDX-License-Identifier:    Apache-2.0
 *************************************************************/
/* eslint-enable */
const fs = require('fs');
const yargs = require('yargs');
const pckgJson = require('../package.json');

const URL = 'https://app.trustsource.io';
const CRED_FILENAME = '/.tsrc.json';
const FILL = '                      ';
const execute = require('../lib/cli');

const getOptions = () => {
    let options = yargs
        .options({
            apiKey: {
                alias: 'k',
                default: null,
                describe: 'apiKey'
            },
            project: {
                alias: 'p',
                default: null,
                describe: 'Project name'
            },
            branch: {
                alias: 'b',
                default: null,
                describe: 'Scan branch'
            },
            tag: {
                alias: 't',
                default: null,
                describe: 'Scan tag'
            },
            binaryLinks: {
                default: null,
                describe: 'Binary links separated by comma'
            },
            url: {
                default: null,
                describe: 'url'
            },
            config: {
                alias: 'c',
                default: null,
                describe: 'Config path'
            },
            proxy: {
                default: null,
                describe: 'Proxy url'
            },
            version: {
                alias: 'v',
                default: false,
                describe: 'Prints a version'
            },
            debug: {
                default: false,
                describe: 'debug'
            },
            simulate: {
                default: false,
                describe: 'simulate'
            },
            meteor: {
                default: false,
                describe: 'meteor'
            }
        })
        .usage(pckgJson.description)
        .help('help', 'Prints a usage statement')
        .fail((msg, err, yargsObject) => {
            if (err) throw err; // preserve stack
            console.error('Please check', yargsObject.help());
            process.exit(1);
        })
        .argv;
    if (options.version) {
        console.info(`${pckgJson.name} version ${pckgJson.version}`);
        process.exit(0);
    }
    options = (({
        apiKey, project, branch, tag, binaryLinks, config, debug, simulate, meteor, url, proxy
    }) => ({
        apiKey, project, branch, tag, binaryLinks, config, debug, simulate, scanMeteor: meteor, url, proxy
    }))(options);
    Object.keys(options).forEach((key) => options[key] === null && delete options[key]);
    return options;
};

const loadConfig = (options) => {
    const values = [
        options.config ? options.config.replace('~', process.env.HOME) : null,
        process.cwd(),
        ((process.env.USERPROFILE || process.env.HOME) + CRED_FILENAME)
    ].map((value) => {
        let result = null;
        if (fs.existsSync(value) && fs.lstatSync(value).isDirectory() && fs.existsSync(`${value}${CRED_FILENAME}`)) {
            result = `${value}${CRED_FILENAME}`;
        } else if (fs.existsSync(value) && fs.lstatSync(value).isFile()) {
            result = value;
        }
        return !result || result.match(/^([a-zA-Z]:)?(\/|\\)/) ? result : `../../../${result}`;
    }).filter((value) => value);
    /* eslint-disable global-require, import/no-dynamic-require */
    return values[0] ? require(values[0]) : {};
    /* eslint-enable global-require, import/no-dynamic-require */
};

const validateOptions = (options) => {
    if (!options.apiKey) {
        throw new Error('Please provide a \'apiKey\' property in credentials file.');
    }

    if (!options.project) {
        throw new Error('Please provide a \'project\' property in credentials file.');
    }
};

let options = getOptions();
options = { url: URL, ...loadConfig(options), ...options };
validateOptions(options);

if (options.debug) {
    console.log('invoking ts-node-client: ');
    console.log(`${FILL}debug =`, options.debug);
    console.log(`${FILL}simulate =`, options.simulate);
    console.log(`${FILL}scanMeteor =`, options.scanMeteor);
    console.log(`${FILL}apiKey = |%s|`, options.apiKey);
    console.log(`${FILL}project = |%s|`, options.project);
    console.log(`${FILL}branch = |%s|`, options.branch);
    console.log(`${FILL}tag = |%s|`, options.tag);
    console.log(`${FILL}binaryLinks = |%s|`, options.binaryLinks);
    console.log(`${FILL}url = |%s|`, options.url);
    console.log(`${FILL}proxy = |%s|`, options.proxy);
}

let exitCode = 0;

process.on('uncaughtException', (err) => {
    console.error('Oops! Something went wrong! :(', err, options.debug ? err.stack : '');
    process.exit(1);
});

process.on('SIGINT', () => {
    console.error('Oops! SIGINT received! :(    -> exiting...');
    process.exit(1);
});

process.on('exit', () => {
    console.log('Exitting normal exitCode=', exitCode);
    process.exit(exitCode);
});


try {
    execute(options, (ok) => {
        exitCode = ok ? 0 : 1;
    });
    console.log('cli.execute()', exitCode);
} catch (error) {
    console.error('Error catched by cmdline interface:', error);
    exitCode = 1;
}
