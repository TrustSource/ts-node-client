/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	MIT
 *********************************************************/
/* eslint-enable */

const request = require('request');
const debuglog = (require('debuglog'))('ecs-rest-client');
const pckgJson = require('../package.json');


function RestClient(options) {
    if (options === undefined) {
        throw new TypeError('Please specify options for rest client');
    } else if (options.url === undefined) {
        throw new TypeError('Please specify \'url\' attribute in options for rest client');
    }
    this.options = options;
}

exports.RestClient = RestClient;

RestClient.prototype.transfer = function transfer(scan, cb) {
    const options = this.options;
    debuglog('transfer started, options:', options);

    const reqOpts = options.requestOptions || {};
    reqOpts.method = 'POST';
    reqOpts.uri = `${options.url}/api/v1/scans`;
    reqOpts.headers = {
        'Content-Type': 'application/json',
        'User-Agent': `${pckgJson.name}/${pckgJson.version}`,
        'X-ApiKey': options.apiKey,
        'X-User': options.user
    };
    reqOpts.json = true;
    reqOpts.body = scan;

    request(reqOpts, (error, response, body) => {
        if (!error && response && response.statusCode === 201) {
            cb(null, body);
        } else {
            debuglog('unexpected response: error=', error, 'response=', response);
            const result = {
                message: 'unexpected response'
            };
            if (error) {
                result.error = error;
            }
            if (response && response.statusCode) {
                result.code = response.statusCode;
            }
            if (body) {
                result.body = body;
            }
            if (!result.code && !error.error) {
                result.response = JSON.stringify(response);
            }
            cb(result);
        }
    });
};
