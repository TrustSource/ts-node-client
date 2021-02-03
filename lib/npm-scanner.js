/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */

const npm = require('global-npm');
const debuglog = (require('debuglog'))('ts-npm-scanner');
const ScanResult = require('./scanresult.js');
const { RestClient } = require('./rest-client');
const Dependency = require('./dependency');

exports.Scanner = Scanner;

function Scanner(options) {
    this.options = options;
    this.name = 'ts-npm-scanner';
}

Scanner.prototype.scan = function scan(cb) {
    const self = this;
    const { options } = this;

    npm.load({ parseable: true, long: false }, (cberr, cbnpm) => {
        if (cberr) {
            debuglog('npm.load - error: ', cberr);
            cb(cberr);
        } else {
            debuglog('npm loaded: prefix = %s', cbnpm.prefix);

            cbnpm.commands.ls([], true, (err, data) => {
                if (err) {
                    debuglog('npm.commands.ls - error:', err);
                    cb(err);
                } else {
                    debuglog('Project: ', data.name, data.version);
                    const dependency = self.walk(data);
                    const result = new ScanResult(
                        options.project,
                        data.name, `npm:${data.name}`,
                        dependency
                    );
                    debuglog('result: ', JSON.stringify(result));
                    cb(undefined, result);
                }
            });
        }
    });
};

Scanner.prototype.transfer = function transfer(scan, cb) {
    const client = new RestClient(this.options);
    client.transfer(scan, cb);
};

/* eslint-disable no-underscore-dangle, prefer-rest-params, no-mixed-operators */
Scanner.prototype.walk = function walk(npmDependency, level) {
    const self = this;
    const opts = this.options || {};
    level = level || 0;

    function log() {
        const args = [].slice.call(arguments, 0);
        if (opts.verbose) {
            console.log.apply(this, args);
        } else {
            debuglog.apply(this, args);
        }
    }

    printDependency(npmDependency, level);

    if (npmDependency.name) {
        const dependency = new Dependency(npmDependency.name, npmDependency.version, 'npm', npmDependency.description,
            npmDependency.private, npmDependency.licenses || npmDependency.license,
            npmDependency.homepage, npmDependency.repository ? npmDependency.repository.url : undefined);

        if (npmDependency.dependencies) {
            Object.getOwnPropertyNames(npmDependency.dependencies).forEach((val) => {
                const childDependency = npmDependency.dependencies[val];
                let child = null;

                // check for errorneous dependencies (e.g a nmp-debug.log file)
                if (childDependency.error) {
                    log('Skipping errorneous dependency on level %d: ', level, val);

                    // check for blacklisted dependencies on level 0
                } else if (level === 0 && (opts.exclude instanceof Array && opts.exclude.indexOf(val) >= 0 || opts.exclude === val)) {
                    log('Skipping level 0 blacklisted dependency: ', val);

                    // include dev dependencies on level 0 if configured
                } else if (level === 0 && opts.includeDevDependencies
                    && npmDependency.devDependencies && npmDependency.devDependencies[val]) {
                    log('Adding level 0 devDependency:', val);
                    child = self.walk(npmDependency.dependencies[val], level + 1);

                    // include runtime dependencies
                } else if (npmDependency._dependencies && npmDependency._dependencies[val]) {
                    log('Adding dependency on level %d:', level, val);
                    child = self.walk(npmDependency.dependencies[val], level + 1);
                } else {
                    log('Skipping undeclared dependency on level %d: ', level, val);
                }
                if (child) {
                    dependency.addDependency(child);
                }
            });
        }
        return dependency;
    }
    return null;
};
/* eslint-enable no-underscore-dangle, prefer-rest-params, no-mixed-operators */

function printDependency(dep, level) {
    level = level || 0;
    const fill = level === 0 ? '' : new Array(level * 4).join(' ');

    debuglog(`${fill}-----------------------------------------`);
    debuglog(`${fill}Name, Version: `, dep.name, dep.version);
    debuglog(`${fill}License: `, dep.license || dep.licenses);
    debuglog(`${fill}Private: `, dep.private);
    debuglog(`${fill}Description: `, dep.description);
    if (dep.repository) {
        debuglog(`${fill}Repsitory type:`, dep.repository.type);
        debuglog(`${fill}Repsitory url:`, dep.repository.url);
    }
    debuglog(`${fill}Homdepage: `, dep.homepage);
}
