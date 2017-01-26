/*
 * Copyright (c) 2016. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	MIT
 */

'use strict';
const debuglog = (require('debuglog'))('ecs-node-client');
const stdlog = console.log;
const MODULE_NAME = 'ecs-node-client:cli';

module.exports = scan;

var NpmScanner = promisify(require('./npm-scanner').Scanner);
var MeteorScanner = promisify(require('./meteor-scanner').Scanner);

function scan(options, scanDone) {
    if(typeof(scanDone) !== 'function') {
        throw new Error('Please provide a callback function as 2nd argument.');
    }

    if(options.baseUrl.endsWith('/')) {
        options.baseUrl = options.baseUrl.slice(0, -1);
    }
    options.user = options.credentials.userName;
    options.apiKey = options.credentials.apiKey;
    debuglog(MODULE_NAME + '.scan() reorganized options:', options);

    var npmScanner = new NpmScanner(options);
    var meteorScanner = new MeteorScanner(options);

    npmScanner.scan().then(scanResult => {
        if(options.scanMeteor) {
            debuglog(MODULE_NAME + '.scan() scanMeteor set: scanning meteor dependencies');
            return meteorScanner.scan(scanResult.module).then(meteorScanResult => {
                Array.prototype.push.apply(meteorScanResult.dependencies,scanResult.dependencies);
                return meteorScanResult;
            });
        }
        return scanResult;
    }).then(function(scanResult) {
        if (options.simulate) {
            stdlog(MODULE_NAME + '.scan():' + npmScanner.name + ' simulating, nothing transferred:');
            return;
        }
        return scanResult;
    }).then(function(scanResult) {
        if (scanResult) {
            return npmScanner.transfer(scanResult);
        }
    }).then(
        function(transferResult) {
            if (transferResult) {
                stdlog(MODULE_NAME +'.scan():' + npmScanner.name + ' successfully transferred scan to server:'
                    + JSON.stringify(transferResult));
            }
            debuglog(MODULE_NAME + 'scan(): finished', transferResult);
            scanDone(true);
        },
        function(error) {
            stdlog(MODULE_NAME + '.scan():' + npmScanner.name + ' error transferring scan:' + JSON.stringify(error));
            return Promise.reject();
        }
    ).catch(function(error) {
        if(error) stdlog(MODULE_NAME + 'scan(): error', error);
        scanDone(false);
    });
}

function promisifyFunc(func) {
    if(typeof(func) === 'function') {
        return function() {
            var args = Array.from(arguments);
            var self = this;

            return new Promise(function(resolve, reject) {
                args.push(function(error, data){
                    if(error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
                func.apply(self, args);
            });
        }
    }
    return func;
}

function promisify(scanner) {
    if(scanner && scanner.prototype) {
        scanner.prototype.scan = promisifyFunc(scanner.prototype.scan);
        scanner.prototype.transfer = promisifyFunc(scanner.prototype.transfer);
    }
    return scanner;
}