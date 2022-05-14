/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:  Apache-2.0
 *********************************************************/
/* eslint-enable */
const PackageURL = require('./pkg');

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
    } else {
        parts = parts || { mgr: true, component: true, version: true };

        const partsCnt = (parts.mgr ? 1 : 0) + (parts.component ? 1 : 0) + (parts.version ? 1 : 0);
        const splitParts = key.split(':');
        // component may exists of more than one part
        if ((parts.component && splitParts.length < partsCnt) || (!parts.component && splitParts.length !== partsCnt)) {
            // throw new Error('invalid key format:' + key);
        } else {
            let compStartIdx = 0; let
                compEndIdx = splitParts.length;
            if (parts.mgr) {
                // eslint-disable-next-line prefer-destructuring
                this.manager = splitParts[0];
                // eslint-disable-next-line no-plusplus
                compStartIdx++;
            }
            if (parts.version) {
                this.version = splitParts[splitParts.length - 1];
                // eslint-disable-next-line no-plusplus
                compEndIdx--;
            }
            if (parts.component) {
                this.component = '';
                // eslint-disable-next-line no-plusplus
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

function getPackageUrl(componentKey, version) {
    const result = new ComponentKey(componentKey, { mgr: true, component: true });
    if (result && result.component && result.manager !== 'im') {
        const parts = result.component.split(':');
        const org = parts.length > 1 ? parts[0] : null;
        const key = parts.length > 1 ? parts[1] : parts[0];
        if (key) {
            return PackageURL.get(result.manager, org, key, version);
        }
        return null;
    }
    return null;
}

function getSpdxFormattedKey(componentKey) {
    return componentKey.split(':').join('-');
}

function dependencyToCydxComponent(dependency) {
    const {
        name, key, description, homepageUrl, repoUrl, licenses, versions
    } = dependency;
    const version = versions && versions[0];
    const purl = getPackageUrl(key, version);
    const comp = {
        type: 'library',
        'bom-ref': purl,
        name,
        version,
        description,
        purl,
        externalReferences: []
    };
    if (licenses && licenses[0] && licenses[0].name) {
        comp.licenses = [
            {
                license: {
                    id: licenses[0].name
                }
            }
        ];
    }
    if (repoUrl) {
        comp.externalReferences.push({
            type: 'vcs',
            url: repoUrl
        });
    }
    if (homepageUrl) {
        comp.externalReferences.push({
            type: 'website',
            url: homepageUrl
        });
    }
    return comp;
}

function dependencyToSpdxComponent(dependency) {
    const {
        name, key, homepageUrl, repoUrl, licenses, versions
    } = dependency;
    const version = versions && versions[0];
    const comp = {
        SPDXID: `SPDXRef-${getSpdxFormattedKey(key)}`,
        // TODO implement Copyright meta
        copyrightText: '',
        filesAnalyzed: false,
        name,
        versionInfo: version
    };
    if (licenses && licenses[0] && licenses[0].name) {
        comp.licenseConcluded = licenses[0].name;
        comp.licenseDeclared = licenses[0].name;
        comp.licenseInfoFromFiles = [licenses[0].name];
    }
    if (repoUrl) {
        comp.downloadLocation = repoUrl;
    }
    if (homepageUrl) {
        comp.homepage = homepageUrl;
    }
    return comp;
}

function handleDependency(list, dependency, type, relationships, parent) {
    let component;
    if (type === 'cydx') {
        component = dependencyToCydxComponent(dependency);
    } else if (type === 'spdx') {
        component = dependencyToSpdxComponent(dependency);
    } else {
        component = dependency;
    }
    if (component) {
        const hasComponent = list.find((item) => (item.SPDXID && item.SPDXID === component.SPDXID)
          || (item['bom-ref'] && item['bom-ref'] === component['bom-ref']));
        if (!hasComponent) {
            list.push(component);
        }
    }
    if (relationships && parent) {
        if (parent.creationInfo) {
            relationships.push({
                spdxElementId: parent.SPDXID,
                relatedSpdxElement: component.SPDXID,
                relationshipType: 'DESCRIBES'
            });
        }
        relationships.push({
            spdxElementId: parent.SPDXID,
            relatedSpdxElement: component.SPDXID,
            relationshipType: 'CONTAINS'
        });
    }
    if (dependency.dependencies) {
        dependency.dependencies.forEach((child) => {
            handleDependency(list, child, type, relationships, component);
        });
    }
}

Convertor.scanToCydx = function scanTo(scan) {
    const date = new Date();
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
            ]
        },
        components: []
    };
    if (scan.dependencies && scan.dependencies[0]) {
        cydx.components = [];
        handleDependency(cydx.components, scan.dependencies[0], 'cydx');
        if (cydx.components.length > 0) {
            // eslint-disable-next-line prefer-destructuring
            cydx.metadata.component = cydx.components[0];
            cydx.components.shift();
        }
    }
    return cydx;
};

Convertor.scanToSpdx = function scanTo(scan) {
    const date = new Date();
    const spdx = {
        SPDXID: 'SPDXRef-DOCUMENT',
        spdxVersion: 'SPDX-2.0',
        creationInfo: {
            created: date.toISOString(),
            creators: [
                'Tool: ts-node-client > 1.8.1',
                'Organization: TrustSource'
            ],
            licenseListVersion: '2.5'
        },
        dataLicense: 'CC0-1.0'
    };
    if (scan.dependencies && scan.dependencies[0]) {
        spdx.packages = [];
        spdx.relationships = [];
        handleDependency(spdx.packages, scan.dependencies[0], 'spdx', spdx.relationships, spdx);
        if (spdx.packages.length > 0) {
            const first = spdx.packages[0];
            spdx.name = first.name;
            spdx.documentDescribes = [first.SPDXID];
            spdx.documentNamespace = `https://app.trustsource.io/spdx/${spdx.name}`;
        }
    }
    return spdx;
};


module.exports = Convertor;

