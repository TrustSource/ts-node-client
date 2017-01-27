/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	MIT
 *********************************************************/
/* eslint-enable */

const fs = require('fs');
const path = require('path');
const ScanResult = require('./scanresult.js');
const debuglog = (require('debuglog'))('ecs-meteor-scanner');
const RestClient = require('./rest-client').RestClient;
const Dependency = require('./dependency');

exports.Scanner = Scanner;

const METEOR_PREFIX = 'atm'; // short for atmosphere packages

function Scanner(options) {
    this.options = options;
    this.name = 'ecs-meteor-scanner';
}

Scanner.prototype.scan = function scan(module, cb) {
    const self = this;
    const options = self.options;

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
    const dependencies = lines.map((l) => {
        const parts = l.split('@');
        if (parts.length === 2) {
            printDependency(parts);
            return new Dependency(parts[0], parts[1], 'atm');
        }
        return null;
    }).filter(Boolean); // remove falsy values
    return dependencies;
};


function printDependency(parts) {
    debuglog('-----------------------------------------');
    debuglog('Name, Version: ', parts[0], parts[1]);
}
