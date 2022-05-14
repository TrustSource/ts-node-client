/* eslint-disable */
/**********************************************************
 * Copyright (c) 2022. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:  Apache-2.0
 *********************************************************/
/* eslint-enable */

const PackageURL = {};

PackageURL.get = function get(manager, org, key, version) {
    // scheme:type/namespace/name@version?qualifiers#subpath
    const parts = [];
    let partVersion;
    if (manager) {
        parts.push(fixPart(manager));
    }
    if (org) {
        parts.push(fixPart(org));
    }
    if (key) {
        parts.push(fixPart(key));
    }
    if (version) {
        partVersion = `@${fixPart(version)}`;
    }
    return `pkg:${parts.join('/')}${partVersion}`;
};

function fixPart(str) {
    const newStr = encodeURI(str);
    return newStr.replace('%3A', ':');
}

module.exports = PackageURL;

