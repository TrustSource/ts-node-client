/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */
/* eslint-env mocha */

const assert = require('assert');
const nock = require('nock');
const { RestClient } = require('../lib/rest-client');

const JSON_TYPE = 'application/json';
const url = 'http://localhost:3000';

/* eslint-disable no-new */
describe('RestClient', () => {
    describe('Constructor', () => {
        it('should throw Error if no options defined', () => {
            assert.throws(() => {
                new RestClient();
            }, TypeError);
        });
        it('should throw Error if no url attribute defined', () => {
            assert.throws(() => {
                new RestClient({});
            }, TypeError);
        });
        it('should accept url attribute', () => {
            assert.doesNotThrow(() => {
                const restClient = new RestClient({ url });
                assert.notEqual(restClient, undefined);
            });
        });
    });

    describe('transfer method', () => {
        let restClient;

        beforeEach(() => {
            restClient = new RestClient({ url: 'http://localhost:3000' });
        });

        it('should call callback with response data if no error orccurs', (done) => {
            nock(url, {
                reqheaders: {
                    'Content-Type': JSON_TYPE
                }
            }).post('/api/v1/scans').reply(201, 'Test response');

            restClient.transfer({}, (err, data) => {
                assert.equal(err, null);
                assert.equal(data, 'Test response');
                done();
            });
        });

        it('response should be parsed as json object, if \'content-type\': \'application/json\'', (done) => {
            nock(url, {
                reqheaders: {
                    'Content-Type': JSON_TYPE
                }
            }).defaultReplyHeaders({
                'Content-Type': JSON_TYPE
            }).post('/api/v1/scans').reply(201, '{"bli": "blub"}');

            restClient.transfer({}, (err, data) => {
                assert.equal(err, null);
                assert.deepEqual(data, { bli: 'blub' });
                done();
            });
        });
    });
});
