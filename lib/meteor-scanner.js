/*
 * Copyright (c) 2016. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	MIT
 */
var fs = require('fs'),
    path = require('path'),
    ScanResult = require("./scanresult.js"),
    debuglog = (require('debuglog'))('ecs-meteor-scanner'),
    RestClient = require("./rest-client").RestClient,
    Dependency = require('./dependency');

exports.Scanner = Scanner;


const METEOR_PREFIX = 'atm'; //short for atmosphere packages

function Scanner(options) {
    this.options = options;
    this.name = 'ecs-meteor-scanner';
}


Scanner.prototype.scan = function scan(module, cb) {
    var self = this;
    var options = self.options;

    var meteorVersions = path.resolve(process.cwd(), '.meteor/versions');

    fs.readFile(meteorVersions, function(err, data) {
        if(err) cb(err);
        const array = data.toString().split("\n");
        const dependencies = self.gatherDependencies(array);

        const scan = new ScanResult(options.project, module, `${METEOR_PREFIX}:${module}`, dependencies);
        cb(undefined, scan);
    });
};

Scanner.prototype.transfer = function transfer(scan, cb) {
    var client = new RestClient(this.options);
    client.transfer(scan, cb);
};

Scanner.prototype.gatherDependencies = function(lines) {
    const dependencies =lines.map((l, i) => {
        const parts = l.split('@');
        if (parts.length === 2) {
            printDependency(parts);
            return new Dependency(parts[0], parts[1], 'atm');
        }
    }).filter(Boolean); // remove falsy values
    return dependencies;
};


function printDependency(parts) {
    debuglog('-----------------------------------------');
    debuglog("Name, Version: ", parts[0], parts[1]);
}
