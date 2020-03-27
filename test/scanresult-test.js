/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */
/* eslint-env mocha */

const assert = require('assert');
const Dependency = require('../lib/dependency');
const ScanResult = require('../lib/scanresult');


describe('ScanResult', () => {
    describe('Constructor', () => {
        it('should handle dependencies as array', () => {
            const root1 = new Dependency('root1', '1.1', '---');
            const root2 = new Dependency('root2', '2.0', '---');
            const child1 = new Dependency('child1', '1.0', '---');
            const deps = [root1, root2];
            const scanResult = new ScanResult('project', 'module', 'moduleId', deps);

            root1.addDependency(child1);

            assert.equal(scanResult.dependencies.length, 2);
            assert.equal(scanResult.dependencies[0], root1);
            assert.equal(scanResult.dependencies[1], root2);
            assert.equal(scanResult.dependencies[0].dependencies[0], child1);
        });

        it('should handle dependencies as hash', () => {
            const deps = { root1: new Dependency('root1', '1.1', '---'), root2: new Dependency('root2', '2.0', '---') };
            deps.root1.addDependency(new Dependency('child1', '1.0.0', '---'));
            const scanResult = new ScanResult('project', 'module', 'moduleId', deps);

            assert.equal(scanResult.dependencies.length, 2);
            assert.equal(scanResult.dependencies[0].name, 'root1');
            assert.equal(scanResult.dependencies[1].name, 'root2');
            assert.equal(scanResult.dependencies[0].dependencies[0].name, 'child1');
        });
    });
});

