/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */

const fs = require('fs');
const path = require('path');
const debuglog = (require('debuglog'))('ts-npm-scanner');
const ScanResult = require('./scanresult');
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

    const files = path.resolve(process.cwd(), 'package-lock.json');

    fs.readFile(files, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                const file = path.resolve(process.cwd(), 'package.json');
                fs.readFile(file, (error, packageData) => {
                    if (error) {
                        debuglog('npm.fs.package - error:', err);
                        cb(err);
                    } else {
                        const jsonFile = JSON.parse(packageData);
                        debuglog('Project: ', jsonFile.name, jsonFile.version);
                        const dependencies = self.walkPackage(jsonFile, 0, jsonFile);
                        const result = new ScanResult(options.project, jsonFile.name, `npm:${jsonFile.name}`, dependencies);
                        debuglog('result: ', JSON.stringify(result));
                        cb(undefined, result);
                    }
                });
            } else {
                debuglog('npm.fs.package-lock - error:', err);
                cb(err);
            }
        } else {
            const jsonFile = JSON.parse(data);
            debuglog('Project: ', jsonFile.name, jsonFile.version);
            const dependencies = self.walk(jsonFile, 0, jsonFile);
            const result = new ScanResult(options.project, jsonFile.name, `npm:${jsonFile.name}`, dependencies);
            debuglog('result: ', JSON.stringify(result));
            cb(undefined, result);
        }
    });
};

Scanner.prototype.transfer = function transfer(scan, cb) {
    const client = new RestClient(this.options);
    client.transfer(scan, cb);
};

/* eslint-disable no-underscore-dangle, prefer-rest-params, no-mixed-operators */
Scanner.prototype.walk = function walk(npmDependency, level, root) {
    const self = this;
    const opts = this.options || {};
    level = level || 0;

    printDependency(npmDependency, level);

    if (npmDependency.name) {
        let pkg = root && root.packages && root.packages[`node_modules/${npmDependency.name}`];
        if (!pkg) {
            pkg = root && root.packages && root.packages[''];
        }
        let repository = npmDependency.repository && npmDependency.repository.url;
        if (!repository) {
            repository = pkg && pkg.repository && pkg.repository.url;
        }
        const dependency = new Dependency(
            npmDependency.name,
            npmDependency.version,
            'npm',
            npmDependency.description,
            npmDependency.private,
            npmDependency.licenses || npmDependency.license || (pkg && (pkg.licenses || pkg.license)),
            npmDependency.homepage || (pkg && pkg.homepage),
            repository
        );
        if (npmDependency.dependencies) {
            Object.getOwnPropertyNames(npmDependency.dependencies).forEach((val) => {
                const childDependency = npmDependency.dependencies[val];
                if (childDependency) {
                    childDependency.name = val;
                }
                checkForChild(self, opts, dependency, childDependency, val, level, root);
            });
        }
        return dependency;
    }
    return null;
};

function checkForChild(self, opts, dependency, childDependency, val, level, root) {
    let child = null;

    function log() {
        const args = [].slice.call(arguments, 0);
        if (opts.verbose) {
            console.log.apply(this, args);
        } else {
            debuglog.apply(this, args);
        }
    }
    // check for errorneous dependencies (e.g a nmp-debug.log file)
    if (childDependency.error) {
        log('Skipping errorneous dependency on level %d: ', level, val);
        // check for blacklisted dependencies on level 0
    } else if (level === 0 && (opts.exclude instanceof Array && opts.exclude.indexOf(val) >= 0 || opts.exclude === val)) {
        log('Skipping level 0 blacklisted dependency: ', val);
        // include dev dependencies on level 0 if configured
    } else if (level === 0 && opts.includeDevDependencies && childDependency && childDependency.dev) {
        log('Adding level 0 devDependency:', val);
        child = self.walk(childDependency, level + 1, root);
        // include runtime dependencies
    } else if (childDependency && !childDependency.dev) {
        log('Adding dependency on level %d:', level, val);
        child = self.walk(childDependency, level + 1, root);
    } else {
        log('Skipping undeclared dependency on level %d: ', level, val);
    }
    if (child) {
        dependency.addDependency(child);
    }
}

/* eslint-enable no-underscore-dangle, prefer-rest-params, no-mixed-operators */
// eslint-disable-next-line sonarjs/cognitive-complexity
Scanner.prototype.walkPackage = function walkPackage(npmDependency, level) {
    const self = this;
    const opts = this.options || {};
    level = level || 0;

    printDependency(npmDependency, level);

    if (npmDependency.name) {
        const repository = npmDependency.repository && npmDependency.repository.url;
        const dependency = new Dependency(
            npmDependency.name,
            npmDependency.version,
            'npm',
            npmDependency.description,
            npmDependency.private,
            npmDependency.licenses || npmDependency.license,
            npmDependency.homepage,
            repository
        );
        if (npmDependency.dependencies) {
            Object.getOwnPropertyNames(npmDependency.dependencies).forEach((val) => {
                const childDependency = {
                    name: val,
                    version: npmDependency.dependencies[val]
                };

                checkForChild(self, opts, dependency, childDependency, val, level);
            });
            if (opts.includeDevDependencies) {
                Object.getOwnPropertyNames(npmDependency.devDependencies).forEach((val) => {
                    const childDependency = {
                        name: val,
                        version: npmDependency.devDependencies[val]
                    };

                    checkForChild(self, opts, dependency, childDependency, val, level);
                });
            }
        }
        return dependency;
    }
    return null;
};

function printDependency(dep, level) {
    level = level || 0;
    const fill = level === 0 ? '' : new Array(level * 4).join(' ');

    debuglog(`${fill}-----------------------------------------`);
    debuglog(`${fill}Name, Version: `, dep.name, dep.version);
    debuglog(`${fill}License: `, dep.license || dep.licenses);
    debuglog(`${fill}Private: `, dep.private);
    debuglog(`${fill}Description: `, dep.description);
    if (dep.repository) {
        debuglog(`${fill}Repository type:`, dep.repository.type);
        debuglog(`${fill}Repository url:`, dep.repository.url);
    }
    debuglog(`${fill}Homepage: `, dep.homepage);
}
