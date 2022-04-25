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
        parts.push(encodeURI(manager));
    }
    if (org) {
        parts.push(encodeURI(org).replace('%3A', ':'));
    }
    if (key) {
        parts.push(encodeURI(key).replace('%3A', ':'));
    }
    if (version) {
        partVersion = `@${encodeURI(version).replace('%3A', ':')}`;
    }
    return `pkg:${parts.join('/')}${partVersion}`;
};


module.exports = PackageURL;

