/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */

const fs = require('fs');
const path = require('path');
const debuglog = (require('debuglog'))('ts-meteor-scanner');
const ScanResult = require('./scanresult');
const { RestClient } = require('./rest-client');
const Dependency = require('./dependency');

exports.Scanner = Scanner;

const METEOR_PREFIX = 'atm'; // short for atmosphere packages

function Scanner(options) {
    this.options = options;
    this.name = 'ts-meteor-scanner';
}

Scanner.prototype.scan = function scan(module, cb) {
    const self = this;
    const { options } = self;

    const meteorVersions = path.resolve(process.cwd(), '.meteor/versions');

    fs.readFile(meteorVersions, (err, data) => {
        if (err) cb(err);
        const array = data.toString().split('\n');
        const dependencies = self.gatherDependencies(array);
        const result = new ScanResult(options.project, module, `${METEOR_PREFIX}:${module}`, dependencies);
        cb(undefined, result);
    });
};

Scanner.prototype.transfer = function transfer(scan, cb) {
    const client = new RestClient(this.options);
    client.transfer(scan, cb);
};

Scanner.prototype.gatherDependencies = function gatherDependencies(lines) {
    // remove falsy values
    return lines.map((l) => {
        const parts = l.split('@');
        if (parts.length === 2) {
            printDependency(parts);
            return new Dependency(parts[0], parts[1], 'atm');
        }
        return null;
    }).filter(Boolean);
};


function printDependency(parts) {
    debuglog('-----------------------------------------');
    debuglog('Name, Version: ', parts[0], parts[1]);
}
