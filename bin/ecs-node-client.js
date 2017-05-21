#!/usr/bin/env node

/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	MIT
 *********************************************************/
/* eslint-enable */

const BASE_URL = 'https://ecs-app.eacg.de';
const CRED_FILENAME = (process.argv.find(e => e.startsWith('--credentialsFile=')) || '').substr(18) || '/.ecsrc.json';
const FILL = '                      ';

const execute = require('../lib/cli');

const debug = (process.argv.indexOf('--debug') > -1);
const simulate = (process.argv.indexOf('--simulate') > -1);
const scanMeteor = (process.argv.indexOf('--meteor') > -1);
const project = (process.argv.find(e => e.startsWith('--project=')) || '').substr(10);
const baseUrl = (process.argv.find(e => e.startsWith('--baseUrl=')) || '').substr(10) || BASE_URL;
const credFile = (process.argv.find(e => e.startsWith('--credentials=')) || '').substr(14) ||
                 ((process.env.USERPROFILE || process.env.HOME) + CRED_FILENAME);

if (debug) {
    console.log('invoking ecs-node-client: ');
    console.log(`${FILL}debug =`, debug);
    console.log(`${FILL}simulate =`, simulate);
    console.log(`${FILL}scanMeteor =`, scanMeteor);
    console.log(`${FILL}project = |%s|`, project);
    console.log(`${FILL}baseUrl = |%s|`, baseUrl);
}

var credentials;
try {
    /* eslint-disable global-require, import/no-dynamic-require */
    credentials = require(credFile);
    /* eslint-enable global-require, import/no-dynamic-require */

    if (!credentials.userName || !credentials.apiKey) {
        throw new Error('Please provide a \'userName\' and \'apiKey\' property in credentials file.');
    }

    if (!project) {
        throw new Error('Please provide the project name as commandline argument \'--project=PROJECT_NAME\'.');
    }
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error('Credentialsfile \'%s\' not found', credFile);
    } else {
        console.error(error.message || error);
    }
    process.exit(1);
}

var exitCode = 0;

process.on('uncaughtException', (err) => {
    console.error('Oops! Something went wrong! :(', err, debug ? err.stack : '');
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
    execute({ debug, simulate, project, scanMeteor, baseUrl, credentials }, (ok) => {
        exitCode = ok ? 0 : 1;
    });
    console.log('cli.execute()', exitCode);
} catch (error) {
    console.error('Error catched by cmdline interface:', error);
    exitCode = 1;
}
