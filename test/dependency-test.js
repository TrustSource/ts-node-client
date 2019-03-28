/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	MIT
 *********************************************************/
/* eslint-enable */
/* eslint-env mocha */


const assert = require('assert');
const Dependency = require('../lib/dependency');

/* eslint-disable no-new, no-new-wrappers */
describe('Dependency', () => {
    describe('Constructor', () => {
        it('should set key with "system" as prefix for name', () => {
            assert.equal(new Dependency('karl', '---', 'npm').key, 'npm:karl');
        });

        it('should set name, version, description, homepageUrl and repoUrl', () => {
            const dep = new Dependency('name', 'version', '---', 'description', '---', '---', 'home', 'repo');
            assert.equal(dep.name, 'name');
            assert.deepEqual(dep.versions, ['version']);
            assert.equal(dep.description, 'description');
            assert.equal(dep.homepageUrl, 'home');
            assert.equal(dep.repoUrl, 'repo');
        });

        it('should set private even if undefined', () => {
            assert.equal(new Dependency('name', 'version', '---', 'descr', true).private, true);
            assert.equal(new Dependency('name', 'version', '---', 'descr', false).private, false);
            assert.equal(new Dependency('name', 'version', '---', 'descr', undefined).private, false);
        });

        it('should set license as object', () => {
            assert.deepEqual(new Dependency('---', '---', '---', '', true, 'MIT').licenses[0], { name: 'MIT' });
            assert.deepEqual(new Dependency('---', '---', '---', '', true, { type: 'MIT' }).licenses[0], { name: 'MIT' });
            assert.deepEqual(new Dependency('---', '---', '---', '', true, { type: 'MIT', url: 'https://test' }).licenses[0],
                { name: 'MIT', url: 'https://test' });
        });

        it('should set license as array', () => {
            assert.deepEqual(new Dependency('---', '---', '---', '', true, ['MIT', 'Apache']).licenses,
                [{ name: 'MIT' }, { name: 'Apache' }]);
        });

        it('should set license as array of objects', () => {
            assert.deepEqual(new Dependency('---', '---', '---', '', true, [{ type: 'MIT', url: 'url' }, { type: 'Apache' }]).licenses,
                [{ name: 'MIT', url: 'url' }, { name: 'Apache' }]);
        });

        it('should not accept empty or invalid name', () => {
            assert.throws(() => {
                new Dependency();
            }, Error);
            assert.throws(() => {
                new Dependency(undefined);
            }, Error);
            assert.throws(() => {
                new Dependency(null);
            }, Error);
            assert.throws(() => {
                new Dependency('');
            }, Error);
            assert.throws(() => {
                new Dependency(new String());
            }, Error);
            assert.throws(() => {
                new Dependency(new String(''));
            }, Error);
            assert.throws(() => {
                new Dependency(1234);
            }, Error);
        });

        it('should accept literal or String object as name', () => {
            assert.doesNotThrow(() => {
                assert.equal(new Dependency('name', '---', '---').name, 'name');
            }, Error);
            assert.doesNotThrow(() => {
                assert.equal(new Dependency(new String('name'), '---', '---').name, 'name');
            }, Error);
        });

        it('should not accept empty or invalid version', () => {
            assert.throws(() => {
                new Dependency('name');
            }, Error);
            assert.throws(() => {
                new Dependency('name', undefined);
            }, Error);
            assert.throws(() => {
                new Dependency('name', null);
            }, Error);
            assert.throws(() => {
                new Dependency('name', '');
            }, Error);
            assert.throws(() => {
                new Dependency('name', new String());
            }, Error);
            assert.throws(() => {
                new Dependency('name', new String(''));
            }, Error);
            assert.throws(() => {
                new Dependency('name', new Date());
            }, Error);
        });

        it('should accept literal or String object as version', () => {
            assert.deepEqual(new Dependency('----', 'version', '---').versions, ['version']);
            assert.deepEqual(new Dependency('---', new String('version'), '---').versions, ['version']);
        });

        it('should not accept empty or invalid key-prefix', () => {
            assert.throws(() => {
                new Dependency('name', 'version');
            }, Error);
            assert.throws(() => {
                new Dependency('name', 'version', undefined);
            }, Error);
            assert.throws(() => {
                new Dependency('name', 'version', null);
            }, Error);
            assert.throws(() => {
                new Dependency('name', 'version', '');
            }, Error);
            assert.throws(() => {
                new Dependency('name', 'version', new String());
            }, Error);
            assert.throws(() => {
                new Dependency('name', 'version', new String(''));
            }, Error);
            assert.throws(() => {
                new Dependency('name', 'version', new Number(3));
            }, Error);
        });

        it('should accept literal or String object as key-prefix', () => {
            assert.deepEqual(new Dependency('name', '---', 'xxx').key, 'xxx:name');
            assert.deepEqual(new Dependency('name', '---', new String('xxx')).key, 'xxx:name');
        });

        it('should extract additional repo-protocol from url', () => {
            assert.deepEqual(new Dependency('name', 'version', '---', 'description', '---', '---', 'home',
                'git+https://github.com/eacg-gmbh/ecs-grunt-plugin.git').repoUrl,
            'https://github.com/eacg-gmbh/ecs-grunt-plugin.git');
            assert.deepEqual(new Dependency('name', 'version', '---', 'description', '---', '---', 'home',
                'svn+http://svnrepo.com/test.svn').repoUrl,
            'http://svnrepo.com/test.svn');
        });


        it('should set defaults', () => {
            const dep = new Dependency('name', 'version', '---');
            assert.deepEqual(dep.versions, ['version']);
            assert.equal(dep.description, undefined);
            assert.equal(dep.private, false);
            assert.equal(dep.licenses.length, 0);
            assert.equal(dep.homepageUrl, undefined);
            assert.equal(dep.repoUrl, undefined);
        });
    });


    describe('addVersion()', () => {
        const dep = new Dependency('name', '1.0.0', '---');
        it('should add version if not exists', () => {
            dep.addVersion('1.1.0');
            assert.deepEqual(dep.versions, ['1.0.0', '1.1.0']);
        });
        it('should not add version if it exists', () => {
            dep.addVersion('1.1.0');
            dep.addVersion('1.0.0');
            assert.deepEqual(dep.versions, ['1.0.0', '1.1.0']);
        });
    });

    describe('getVersion()', () => {
        const dep = new Dependency('name', '3.0.0', '---');
        it('should sort versions in ascending order', () => {
            dep.addVersion('1.1.0');
            dep.addVersion('1.0.0');
            assert.deepEqual(dep.versions, ['1.0.0', '1.1.0', '3.0.0']);
        });
        it('should sort versions invalid versions at the beginning', () => {
            dep.addVersion('karl');
            assert.deepEqual(dep.versions, ['karl', '1.0.0', '1.1.0', '3.0.0']);
        });
    });

    describe('getFirstByName()', () => {
        const target = new Dependency('target', '1.0', '---');
        const deps = [new Dependency('name', '1.0', '---'), new Dependency('other', '2.0', '---'), target];
        const depsObj = { name: deps[0], other: deps[1], target };

        it('should return undefined if not found', () => {
            assert.equal(Dependency.getFirstByName(deps, 'unknown'), undefined);
        });
        it('should find by name', () => {
            assert.deepEqual(Dependency.getFirstByName(deps, 'target'), target);
        });
        it('should find by reference', () => {
            assert.deepEqual(Dependency.getFirstByName(deps, target), target);
        });
        it('should return undefined if not found in Object', () => {
            assert.equal(Dependency.getFirstByName(depsObj, 'unknown'), undefined);
        });
        it('should find by name in Object', () => {
            assert.deepEqual(Dependency.getFirstByName(depsObj, 'target'), target);
        });
        it('should find by reference in Object', () => {
            assert.deepEqual(Dependency.getFirstByName(depsObj, target), target);
        });
    });

    describe('addDependency()', () => {
        let target;
        beforeEach(() => {
            target = new Dependency('target', '1.0', '---');
        });


        it('should throw TypeError if child is not instance if Dependency', () => {
            assert.throws(() => {
                target.addDependency('Test');
            }, TypeError);
        });

        it('should add child nodes to array', () => {
            const child1 = new Dependency('child1', '1.0', '---');
            const child2 = new Dependency('child2', '1.0', '---');

            target.addDependency(child1);
            target.addDependency(child2);

            assert.equal(target.dependencies[0], child1);
            assert.equal(target.dependencies[1], child2);
        });

        it('should add not at child if it is already member of array', () => {
            const child1 = new Dependency('child1', '1.0', '---');

            target.addDependency(child1);
            target.addDependency(child1);

            assert.equal(target.dependencies.length, 1);
            assert.equal(target.dependencies[0], child1);
        });
    });

    describe('addDependencies()', () => {
        let target;

        beforeEach(() => {
            target = new Dependency('target', '1.0', '---');
        });

        const child1 = new Dependency('child1', '1.0.0', '---');
        const child2 = new Dependency('child2', '1.0.0', '---');

        it('should throw TypeError and add nothing if one child is not of type Dependency', () => {
            assert.throws(() => {
                target.addDependencies(new Dependency('child1', '1.0.0', '---'), 'Test');
            }, TypeError);
            assert.equal(target.dependencies.length, 0);
        });

        it('should accept argument list as childs parameter', () => {
            target.addDependencies(child1, child2);
            assert.equal(target.dependencies.length, 2);
            assert.equal(target.dependencies[0], child1);
            assert.equal(target.dependencies[1], child2);
        });

        it('should accept argument list as array parameter', () => {
            target.addDependencies([child1, child2]);
            assert.equal(target.dependencies.length, 2);
            assert.equal(target.dependencies[0], child1);
            assert.equal(target.dependencies[1], child2);
        });
    });
});
