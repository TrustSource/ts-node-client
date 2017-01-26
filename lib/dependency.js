/*
 * Copyright (c) 2015. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	MIT
 */

var semver = require("semver");

function Dependency(name, version, keyPrefix, description, priv, licenses, homepageUrl, repoUrl) {

    this.name = checkStr(name, "name");
    var versions = [checkStr(version, "version", this.name)];

    this.key = checkStr(keyPrefix, "key-prefix", this.name) + ':' + this.name;
    this.description = description;
    this.private = !!priv;
    this.licenses = convertLicenses(licenses);
    this.homepageUrl = homepageUrl;
    this.repoUrl = convertRepoUrl(repoUrl);
    this.dependencies = [];

    Object.defineProperty(this, 'versions', {
        get: function () { return versions.sort(compare); },
        enumerable: true
    });

    this.addVersion = function(version) {
        if(versions.indexOf(version) === -1) {
            versions.push((version));
        }
    }
}

Dependency.prototype.toString = function() {
    return this.name + ":" + this.versions;
};

Dependency.prototype.addDependency = function(child) {
    if(child instanceof Dependency === false) {
        throw new TypeError("Dependency as child expected");
    }

    if(this.dependencies.some(function(e) {
        return e === child || (e.name === child.name && e.key === child.key);
    }) == false) {
        this.dependencies.push(child);
    }
};

Dependency.prototype.addDependencies = function(childs) {
    if(arguments.length === 1 && arguments[0] instanceof Array) {
        return Dependency.prototype.addDependencies.apply(this, childs);
    }
    var i;
    for(i = 0; i < arguments.length; i++) {
        if(arguments[i] instanceof Dependency === false) {
            throw new TypeError("Dependency as child expected");
        }
    }
    for(i = 0; i < arguments.length; i++) {
        this.addDependency(arguments[i]);
    }
};

Dependency.getFirstByName = function(container, dependency) {
    if(dependency instanceof Dependency) {
        dependency = dependency.name;
    }
    if(container instanceof Array) {
        for (var i = 0; i < container.length; i++) {
            if (container[i].name === dependency && container[i] instanceof  Dependency) {
                return container[i];
            }
        }
    } else if(container instanceof Object) {
        if(container[dependency] instanceof Dependency) {
            return container[dependency];
        }
    }
    return undefined;
};

module.exports = Dependency;


function convertRepoUrl(url) {
    var prefixes=['git+', 'svn+'];

    if(url && typeof url === 'string' && url.length > 0) {
        for(var i = 0; i < prefixes.length; i++) {
            if (url.indexOf(prefixes[i]) === 0) {
                return url.substring(prefixes[i].length);
            }
        }
        return url;
    }
    return null;
}

function checkStr(str, name, info) {
    if(str instanceof String) {
        str = str.valueOf(); // convert to primitive
    }
    if(typeof str != 'string' || str.length == 0) {
        var msg = (name || "parameter") + " should be given.";
        if(info){
            msg = msg + " [" + info + "]";
        }
        throw new Error(msg);
    }
    return str;
}


function convertLicenses(licenses) {
    var lics = [];
    if(licenses instanceof Array && licenses.length > 0) {
        licenses.forEach(function(license) {
            pushLicenseObj(lics, license);
        });
    } else {
        pushLicenseObj(lics, licenses);
    }
    return lics;
}

function pushLicenseObj(arr, license) {
    if(license) {
        if (license.url || license.name || license.type) {
            var l = {};
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
    if(license) {
        if (license instanceof String) {
            license = license.valueOf(); // convert to primitive
        }
        if (typeof license == 'string' && license.length) {
            arr.push({name: license});
        }
    }
}


// Return 0 if v1 == v2, or 1 if v1 is greater, or -1 if v2 is greater.
// Sorts in ascending order if passed to Array.sort().
// sorts valid semver version numbers before invalid ones
function compare(a, b) {
    try {
        return semver.compare(a, b);
    } catch(err) {
        if(semver.valid(a)) {
            return 1
        }
        if(semver.valid(b)) {
            return -1;
        }
        return 0;
    }
}
