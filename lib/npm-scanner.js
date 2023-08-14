/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */

const fs = require('fs');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const lockfile = require('@yarnpkg/lockfile');
const yaml = require('js-yaml');
const debuglog = (require('debuglog'))('ts-npm-scanner');
const ScanResult = require('./scanresult');
const { RestClient } = require('./rest-client');
const Dependency = require('./dependency');

exports.Scanner = Scanner;

function Scanner(options) {
    this.options = options;
    this.name = 'ts-npm-scanner';
}

function getPackageJson(self) {
    try {
        const file = path.resolve(process.cwd(), 'package.json');
        const data = fs.readFileSync(file);
        if (data && data.code === 'ENOENT') {
            debuglog('npm.fs.package - error:', data);
            return null;
        }
        const jsonFile = JSON.parse(data);
        debuglog('Project: ', jsonFile.name, jsonFile.version);
        const dependencies = self.walkPackage(jsonFile, 0, jsonFile);
        return { root: jsonFile, dependencies };
    } catch (e) {
        debuglog('npm.fs.package - error:', e);
        return null;
    }
}
function getPackageLockJson(self) {
    try {
        const file = path.resolve(process.cwd(), 'package-lock.json');
        const data = fs.readFileSync(file);
        if (data && data.code === 'ENOENT') {
            debuglog('npm.fs.package-lock - error:', data);
            return null;
        }
        const jsonFile = JSON.parse(data);
        debuglog('Project: ', jsonFile.name, jsonFile.version);
        const dependencies = self.walk(jsonFile, 0, JSON.parse(JSON.stringify(jsonFile)));
        return { root: jsonFile, dependencies };
    } catch (e) {
        debuglog('npm.fs.package-lock - error:', e);
        return null;
    }
}
function getYarnLock(self, packageData) {
    try {
        const file = path.resolve(process.cwd(), 'yarn.lock');
        const data = fs.readFileSync(file);
        if (data && data.code === 'ENOENT') {
            debuglog('npm.fs.yarn-lock - error:', data);
            return null;
        }
        // yarn 1
        try {
            const jsonFile = lockfile.parse(data.toString());
            if (jsonFile && jsonFile.type === 'success') {
                const dependencies = yarnToResults(self, jsonFile.object, packageData);
                return { root: jsonFile, dependencies };
            }
        } catch (e) {
            debuglog('npm.fs.yarn-v1-lock - error:', e);
        }
        // yarn 2+
        try {
            const json = yaml.load(data.toString());
            // eslint-disable-next-line no-underscore-dangle
            if (json && json.__metadata) {
                // eslint-disable-next-line no-underscore-dangle
                delete json.__metadata;
                const dependencies = yarnToResults(self, json, packageData);
                return { root: json, dependencies };
            }
        } catch (e) {
            debuglog('npm.fs.yarn-v2-lock - error:', e);
        }
        debuglog('npm.fs.yarn-lock - error: Failed to parse file');
        return null;
    } catch (e) {
        debuglog('npm.fs.yarn-lock - error:', e);
        return null;
    }
}
function yarnToResults(self, json, packageData) {
    const base = {
        name: (packageData && packageData.root && packageData.root.name) || 'root',
        version: (packageData && packageData.root && packageData.root.version) || '1',
        dependencies: json
    };
    debuglog('Project: ', base.name, base.version);
    return self.walkYarn(base, 0, base);
}
function saveResults(cb, options, root, dependencies) {
    const result = new ScanResult(options.project, root.name, `npm:${root.name}`, dependencies);
    debuglog('result: ', JSON.stringify(result));
    cb(undefined, result);
}

Scanner.prototype.scan = function scan(cb) {
    const self = this;
    const { options } = this;

    const packageData = getPackageJson(self);
    const packageLockData = getPackageLockJson(self);
    const yarnLockData = getYarnLock(self, packageData);
    if (packageData && yarnLockData) {
        yarnLockData.root = packageData.root;
    }
    const data = packageLockData || yarnLockData || packageData;
    if (data && data.root) {
        saveResults(cb, options, data.root, data.dependencies);
    } else {
        const err = {
            status: 404,
            message: 'No results found in `package-lock.json` or `package.json` or `yarn.lock`'
        };
        debuglog('result: ', JSON.stringify(err));
        cb(err);
    }
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
        } else if (npmDependency.packages) {
            Object.getOwnPropertyNames(npmDependency.packages).forEach((val) => {
                const childDependency = npmDependency.packages[val];
                if (childDependency) {
                    const parts = val.split('node_modules/');
                    childDependency.name = parts.length > 1 ? parts.slice(1).join('node_modules/') : parts[0];
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
    } else if (level === 0 && opts.includeDevDependencies
      && (opts.includeDevDependencies !== 'false') && childDependency && childDependency.dev) {
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

// eslint-disable-next-line sonarjs/cognitive-complexity
Scanner.prototype.walkYarn = function walkPackage(npmDependency, level) {
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
                const name = val.split('@')[0];
                const depData = npmDependency.dependencies[val];
                const version = (depData && depData.version) || depData;
                const childDependency = {
                    name,
                    version: version && typeof version === 'string' ? version : null
                };

                checkForChild(self, opts, dependency, childDependency, val, level);
            });
            if (opts.includeDevDependencies && opts.includeDevDependencies !== 'false') {
                Object.getOwnPropertyNames(npmDependency.devDependencies).forEach((val) => {
                    const depData = npmDependency.devDependencies[val];
                    const version = (depData && depData.version) || depData;
                    const childDependency = {
                        name: val,
                        version: version && typeof version === 'string' ? version : null
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
