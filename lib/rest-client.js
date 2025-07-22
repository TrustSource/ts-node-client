/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */
const axios = require('axios').default;
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
    return options.breakOnWarnings;
}

function hasWarnings(analysis) {
    const stats = analysis.statistics;
    return stats ? stats.legal.warnings + stats.vulnerability.warnings + stats.viability.warnings + stats.versioning.warnings : 0;
}

function checkViolations(options) {
    return options.breakOnViolations;
}

function hasViolations(analysis) {
    const stats = analysis.statistics;
    return stats ? stats.legal.violations + stats.vulnerability.violations + stats.viability.violations + stats.versioning.violations : 0;
}

function checkAnalysisResults(options, getReqOpts, cb, i) {
    axios(getReqOpts)
        .then((response) => {
            const scanData = response && response.data;
            if (response && response.status === 200 && scanData && scanData.analysisStatus === 'Finished') {
                if (checkViolations(options) && hasViolations(scanData)) {
                    cb(`Analysis found ${hasViolations(scanData)} violations, see more details: ${response.data.url}`);
                }
                if (checkWarnings(options) && hasWarnings(scanData)) {
                    cb(`Analysis found ${hasWarnings(scanData)} warnings, see more details: ${response.data.url}`);
                }
                // eslint-disable-next-line no-underscore-dangle
                cb(null, { scanId: scanData._id });
            } else {
                const retryPeriod = i * 5000;
                console.log('Analysis is', ((scanData && scanData.analysisStatus) || 'Scheduled'), 'Retry in ', retryPeriod / 1000, 'sec');
                setTimeout(() => {
                    i += 1;
                    checkAnalysisResults(options, getReqOpts, cb, i);
                }, retryPeriod);
            }
        })
        .catch((error) => {
            const errorData = error && typeof error.toJSON === 'function' ? error.toJSON() : false;
            if (errorData && (errorData.status === 404)) {
                const retryPeriod = i * 5000;
                console.log('Analysis is Scheduled', 'Retry in ', retryPeriod / 1000, 'sec');
                setTimeout(() => {
                    i += 1;
                    checkAnalysisResults(options, getReqOpts, cb, i);
                }, retryPeriod);
            } else {
                debuglog('unexpected getResponse: error=', error);
                cb(JSON.stringify(error));
            }
        });
}

exports.RestClient = RestClient;

RestClient.prototype.transfer = function transfer(scan, cb) {
    const { options } = this;
    debuglog('transfer started, options:', options);

    const reqOpts = options.requestOptions || {};
    reqOpts.method = 'post';
    reqOpts.url = `${options.url}/v2/core/scans`;
    if (options.proxy) {
        reqOpts.proxy = options.proxy;
    }
    reqOpts.headers = {
        'Content-Type': 'application/json',
        'User-Agent': `${pckgJson.name}/${pckgJson.version}`,
        'x-api-key': options.apiKey
    };
    if (options.fullUrl) {
        reqOpts.url = options.fullUrl;
        delete reqOpts.headers['x-api-key'];
        reqOpts.headers['x-apikey'] = options.apiKey;
    }
    reqOpts.json = true;
    reqOpts.data = scan;
    if (options.branch) {
        reqOpts.data.branch = options.branch;
    }
    if (options.tag) {
        reqOpts.data.tag = options.tag;
    }
    if (options.binaryLinks) {
        let links = options.binaryLinks.split(',');
        if (links.length) {
            links = links.map((value) => ({
                name: value
            }));
            reqOpts.data.binaryLinks = links;
        }
    }
    return axios(reqOpts)
        .then((response) => {
            if (options.breakOnWarnings || options.breakOnViolations) {
                const getReqOpts = reqOpts;
                getReqOpts.method = 'get';
                getReqOpts.url += `/${response.data.scanId}`;
                delete getReqOpts.data;
                let i = 1; // eslint-disable-line prefer-const
                checkAnalysisResults(options, getReqOpts, cb, i);
            } else {
                cb(null, response.data);
            }
        })
        .catch((error) => {
            debuglog('unexpected response: error=', error);
            cb(JSON.stringify(error));
        });
};
