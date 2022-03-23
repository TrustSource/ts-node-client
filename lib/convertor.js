/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */
const PackageURL = require('packageurl-js');

const Convertor = {};

Convertor.scanTo = function scanTo(type, scan) {
    if (type.toLowerCase() === 'cydx') {
        return Convertor.scanToCydx(scan);
    }
    if (type.toLowerCase() === 'spdx') {
        return Convertor.scanToSpdx(scan);
    }
    return scan;
};

function ComponentKey(key, parts) {
    if (!key || typeof key.split !== 'function') {
        // throw new Error('key must be a string');
    }else{
        parts = parts || {mgr: true, component: true, version: true};

        const partsCnt = (parts.mgr ? 1 : 0) + (parts.component ? 1 : 0) + (parts.version ? 1 : 0);
        const splitParts = key.split(':');
        // component may exists of more than one part
        if (parts.component && splitParts.length < partsCnt || !parts.component && splitParts.length !== partsCnt) {
            //throw new Error('invalid key format:' + key);
        }else {
            let compStartIdx = 0, compEndIdx = splitParts.length;
            if (parts.mgr) {
                this.manager = splitParts[0];
                compStartIdx++;
            }
            if (parts.version) {
                this.version = splitParts[splitParts.length - 1];
                compEndIdx--;
            }
            if (parts.component) {
                this.component = '';
                for (let i = compStartIdx; i < compEndIdx; i++) {
                    if (this.component) {
                        this.component += ':';
                    }
                    this.component += splitParts[i];
                }
            }
        }
    }
}

function getPackageUrl(componentKey) {
    const result = new ComponentKey(componentKey, {mgr: true, component: true});
    if(result && result.component && result.manager !== 'im'){
        const parts = result.component.split(':');
        const org = parts.length > 1 ? parts[0]: null;
        const key = parts.length > 1 ? parts[1]: parts[0];
        if(key){
            const packageUrl = new PackageURL(result.manager, org, key)
            return packageUrl.toString();
        }else{
            return null
        }
    }else{
        return null
    }
};

function dependencyToComponent(dependency){
    const {name, key, description, homepageUrl, repoUrl, licenses, versions} = dependency;
    const purl = getPackageUrl(key);
    const comp = {
        type: 'library',
        'bom-ref': purl,
        name,
        version: versions[0],
        description,
        purl,
        externalReferences: []
    }
    if(licenses && licenses[0] && licenses[0].name){
        comp.licenses = [
            {
                license: {
                    id: licenses[0].name
                }
            }
        ]
    }
    if(repoUrl){
        comp.externalReferences.push({
            type: 'vcs',
            url: repoUrl
        })
    }
    if(homepageUrl){
        comp.externalReferences.push({
            type: 'website',
            url: homepageUrl
        })
    }
    return comp
}

function handleDependency(list, dependency) {
    const component = dependencyToComponent(dependency);
    if (component) {
        list.push(component)
    }
    if (dependency.dependencies) {
        dependency.dependencies.forEach((child) => {
            handleDependency(list, child);
        });
    }
}

Convertor.scanToCydx = function scanTo(scan) {
    const date = new Date()
    const cydx = {
        bomFormat: 'CycloneDX',
        specVersion: '1.3',
        serialNumber: 'urn:uuid:ea788421-7eb0-448b-833e-b32dd0f39d0c',
        version: 1,
        metadata: {
            timestamp: date.toISOString(),
            tools: [
                {
                    vendor: 'CycloneDX',
                    name: 'Node.js module',
                    version: '3.6.0'
                }
            ],
        },
        components: []
    };
    if (scan.dependencies && scan.dependencies[0]) {
        cydx.components = [];
        handleDependency(cydx.components, scan.dependencies[0]);
        if (cydx.components.length > 0) {
            // eslint-disable-next-line prefer-destructuring
            cydx.metadata.component = cydx.components[0];
            cydx.components.shift();
        }
    }
    return cydx;
};

Convertor.scanToSpdx = function scanTo(scan) {
    return scan;
};


module.exports = Convertor;

