/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */

const request = require('request');
const debuglog = (require('debuglog'))('ts-rest-client');
const pckgJson = require('../package.json');


function RestClient(options) {
    if (options === undefined) {
        throw new TypeError('Please specify options for rest client');
    } else if (options.url === undefined) {
        throw new TypeError('Please specify \'url\' attribute in options for rest client');
    }
    this.options = options;
}

function checkWarnings(options) {
    return options.brakeOnWarnings;
}

function hasWarnings(analysis) {
    const stats = analysis.statistics;
    return stats ? stats.legal.warnings + stats.vulnerability.warnings + stats.viability.warnings + stats.versioning.warnings : 0;
}

function checkViolations(options) {
    return options.brakeOnViolations;
}

function hasViolations(analysis) {
    const stats = analysis.statistics;
    return stats ? stats.legal.violations + stats.vulnerability.violations + stats.viability.violations + stats.versioning.violations : 0;
}

function checkAnalysisResults(options, getReqOpts, cb, error, response, body, i) {
    request(getReqOpts, (getError, getResponse, getBody) => {
        if (!getError && getResponse && getResponse.statusCode === 200 && getBody.analysisStatus === 'Finished') {
            if (checkViolations(options) && hasViolations(getBody)) {
                throw new Error(`Analysis found ${hasViolations(getBody)} violations, see more details: ${getBody.url}`);
            }
            if (checkWarnings(options) && hasWarnings(getBody)) {
                throw new Error(`Analysis found ${hasWarnings(getBody)} warnings, see more details: ${getBody.url}`);
            }
            // eslint-disable-next-line no-underscore-dangle
            getBody.scanId = getBody._id;
            cb(null, getBody);
        } else if (!getError && getResponse && (getResponse.statusCode === 200 || getResponse.statusCode === 404)) {
            const retryPeriod = i * 5000;
            console.log('Analysis is', (getBody.analysisStatus || 'Scheduled'), 'Retry in ', retryPeriod / 1000, 'sec');
            setTimeout(() => {
                i += 1;
                checkAnalysisResults(options, getReqOpts, cb, error, response, body, i);
            }, retryPeriod);
        } else {
            debuglog('unexpected getResponse: error=', getError, 'response=', getResponse);
            const result = {
                message: 'unexpected getResponse'
            };
            if (getError) {
                result.error = getError;
            }
            if (getResponse && getResponse.statusCode) {
                result.code = getResponse.statusCode;
            }
            if (getBody) {
                result.body = getBody;
            }
            if (!result.code && !getError.error) {
                result.response = JSON.stringify(getResponse);
            }
            cb(result);
        }
    });
}

exports.RestClient = RestClient;

RestClient.prototype.transfer = function transfer(scan, cb) {
    const { options } = this;
    debuglog('transfer started, options:', options);

    const reqOpts = options.requestOptions || {};
    reqOpts.method = 'POST';
    reqOpts.uri = `${options.url}/api/v1/scans`;
    if (options.proxy) {
        reqOpts.proxy = options.proxy;
    }
    reqOpts.headers = {
        'Content-Type': 'application/json',
        'User-Agent': `${pckgJson.name}/${pckgJson.version}`,
        'X-ApiKey': options.apiKey
    };
    reqOpts.json = true;
    reqOpts.body = scan;
    if (options.branch) {
        reqOpts.body.branch = options.branch;
    }
    if (options.tag) {
        reqOpts.body.tag = options.tag;
    }
    if (options.binaryLinks) {
        let links = options.binaryLinks.split(',');
        if (links.length) {
            links = links.map((value) => ({
                name: value
            }));
            reqOpts.body.binaryLinks = links;
        }
    }

    request(reqOpts, (error, response, body) => {
        if (!error && response && response.statusCode === 201) {
            if (options.brakeOnWarnings || options.brakeOnViolations) {
                const getReqOpts = reqOpts;
                getReqOpts.method = 'GET';
                getReqOpts.uri += `/${body.scanId}`;
                delete getReqOpts.body;
                let i = 1;
                checkAnalysisResults(options, getReqOpts, cb, error, response, body, i);
            } else {
                cb(null, body);
            }
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
