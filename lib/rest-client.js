/*
 * Copyright (c) 2015. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	MIT
 */

var request = require('request');
debuglog = (require('debuglog'))('ecs-rest-client'),
    pckgJson = require('../package.json');

exports.RestClient = RestClient;

function RestClient(options) {
    if(options === undefined) {
        throw new TypeError("Please specify options for rest client");
    } else if(options.baseUrl === undefined) {
        throw new TypeError("Please specify 'baseUrl' attribute in options for rest client");
    }
    this.options = options;
}

RestClient.prototype.transfer = function transfer(scan, cb) {
    var options = this.options;
    debuglog("transfer started, options:", options);

    var reqOpts = options.requestOptions || {};
    reqOpts.method = 'POST';
    reqOpts.uri = options.baseUrl + "/api/v1/scans";
    reqOpts.headers = {
        'Content-Type': 'application/json',
        'User-Agent': pckgJson.name + '/' + pckgJson.version,
        'X-ApiKey': options.apiKey,
        'X-User': options.user
    };
    reqOpts.json =  true;
    reqOpts.body =  scan;

    request(reqOpts, function (error, response, body) {
        if (!error && response && response.statusCode === 201) {
            cb(null, body);
        } else {
            debuglog("unexpected response: error=", error, "response=", response);
            var result = {
                message: "unexpected response"
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
