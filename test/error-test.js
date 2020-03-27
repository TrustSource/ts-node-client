/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */
/* eslint-env mocha */


const assert = require('assert');
const util = require('util');

describe('Error object', () => {
    describe('Base object', () => {
        it('should contain \'name\' and \'message\' fields', () => {
            try {
                throw new Error('test');
            } catch (err) {
                assert.equal(err.name, 'Error');
                assert.equal(err.message, 'test');
            }
        });
    });

    describe('TypeError object', () => {
        it('should contain \'name\' and \'message\' fields', () => {
            try {
                throw new TypeError('test');
            } catch (err) {
                assert.equal(err.name, 'TypeError');
                assert.equal(err.message, 'test');
                assert.equal(typeof err.stack, 'string');
            }
        });
    });

    describe('Custom error object MDN version', () => {
        function MyError(message) {
            this.name = 'MyError';
            this.message = message || 'Default Message';
        }
        MyError.prototype = Object.create(Error.prototype);
        MyError.prototype.constructor = MyError;


        it('should contain \'name\' and \'message\' fields', () => {
            try {
                throw new MyError('test');
            } catch (err) {
                assert.equal(err.name, 'MyError');
                assert.equal(err.message, 'test');
                assert.equal(typeof err.stack, 'undefined');
            }
        });
    });

    describe('Custom error object Node version', () => {
        function MyError(message) {
            Error.call(this);
            this.name = 'MyError';
            this.message = message || 'Default Message';
            Error.captureStackTrace(this);
        }
        util.inherits(MyError, Error); // inherit at least better toString() method

        it('should contain \'name\' and \'message\' fields', () => {
            try {
                throw new MyError('test');
            } catch (err) {
                assert.equal(err.name, 'MyError');
                assert.equal(err.message, 'test');
                assert.equal(typeof err.stack, 'string');
                assert.equal(err.toString(), 'MyError: test');
            }
        });
    });
});
