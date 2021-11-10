/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */

const semver = require('semver');

function Dependency(name, version, keyPrefix, description, priv, licenses, homepageUrl, repoUrl) {
    this.name = checkStr(name, 'name');
    const versions = [checkStr(version, 'version', this.name)];

    this.key = `${checkStr(keyPrefix, 'key-prefix', this.name)}:${this.name}`;
    this.description = description;
    this.private = !!priv;
    this.licenses = convertLicenses(licenses);
    this.homepageUrl = homepageUrl;
    this.repoUrl = convertRepoUrl(repoUrl);
    this.dependencies = [];

    Object.defineProperty(this, 'versions', {
        get() { return versions.sort(compare); },
        enumerable: true
    });

    this.addVersion = function addVersion(vers) {
        if (versions.indexOf(vers) === -1) {
            versions.push((vers));
        }
    };
}

Dependency.prototype.toString = function toString() {
    return `${this.name}:${this.versions}`;
};

Dependency.prototype.addDependency = function addDependency(child) {
    if (child instanceof Dependency === false) {
        throw new TypeError('Dependency as child expected');
    }

    if (this.dependencies.some((e) => e === child || (e.name === child.name && e.key === child.key)) === false) {
        this.dependencies.push(child);
    }
};

Dependency.prototype.addDependencies = function addDependencies(arg1) {
    let args = Array.prototype.slice.call(arguments, 1); // eslint-disable-line prefer-rest-params

    if (arg1 instanceof Dependency) { // called with (Dependency, Dependency, ...)
        args.unshift(arg1);
    } else if (Array.isArray(arg1) && args.length === 0) { // called with ([Dependency])
        args = arg1;
    } else {
        throw new Error('Invalid call syntax: call with (Dependency, Dependency, ...) or ([Dependency])');
    }
    args.forEach((d) => { // fail for all or no argument
        if (d instanceof Dependency === false) {
            throw new TypeError('instance of Dependency as argument expected');
        }
    });
    args.forEach((d) => this.addDependency(d));
};

Dependency.getFirstByName = function getFirstByName(container, dependency) {
    if (dependency instanceof Dependency) {
        dependency = dependency.name;
    }
    if (Array.isArray(container)) {
        return container.find((d) => d instanceof Dependency && d.name === dependency);
    }
    if (container instanceof Object && container[dependency] instanceof Dependency) {
        return container[dependency];
    }
    return undefined;
};

module.exports = Dependency;


function convertRepoUrl(url) {
    const prefixes = ['git+', 'svn+'];

    if (typeof url === 'string' && url.length > 0) {
        const matchPrefix = prefixes.find((p) => url.startsWith(p));
        if (matchPrefix) {
            return url.substring(matchPrefix.length);
        }
        return url;
    }
    return null;
}

function checkStr(str, name, info) {
    if (str instanceof String) {
        str = str.valueOf(); // convert to primitive
    }
    if (typeof str !== 'string' || str.length === 0) {
        let msg = `${name || 'parameter'} should be given.`;
        if (info) {
            msg = `${msg} [${info}]`;
        }
        throw new Error(msg);
    }
    return str;
}


function convertLicenses(licenses) {
    const lics = [];
    if (licenses instanceof Array && licenses.length > 0) {
        licenses.forEach((license) => {
            pushLicenseObj(lics, license);
        });
    } else {
        pushLicenseObj(lics, licenses);
    }
    return lics;
}

function pushLicenseObj(arr, license) {
    if (license) {
        if (license.url || license.name || license.type) {
            const l = {};
            if (license.name || license.type) {
                l.name = license.name || license.type;
            }
            if (license.url) {
                l.url = license.url;
            }
            arr.push(l);
        } else {
            pushLicenseStr(arr, license);
        }
    }
}

function pushLicenseStr(arr, license) {
    if (license) {
        if (license instanceof String) {
            license = license.valueOf(); // convert to primitive
        }
        if (typeof license === 'string' && license.length) {
            arr.push({ name: license });
        }
    }
}


// Return 0 if v1 == v2, or 1 if v1 is greater, or -1 if v2 is greater.
// Sorts in ascending order if passed to Array.sort().
// sorts valid semver version numbers before invalid ones
function compare(a, b) {
    try {
        return semver.compare(a, b);
    } catch (err) {
        if (semver.valid(a)) {
            return 1;
        }
        if (semver.valid(b)) {
            return -1;
        }
        return 0;
    }
}
