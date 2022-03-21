/* eslint-disable */
/**********************************************************
 * Copyright (c) 2017. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	Apache-2.0
 *********************************************************/
/* eslint-enable */

const debuglog = (require('debuglog'))('ts-node-client');
const fs = require('fs');
const Convertor = require('./convertor');

const stdlog = console.log;
const MODULE_NAME = 'ts-node-client:cli';

module.exports = scan;

const NpmScanner = promisify(require('./npm-scanner').Scanner);
const MeteorScanner = promisify(require('./meteor-scanner').Scanner);

function scan(options, scanDone) {
    if (typeof (scanDone) !== 'function') {
        throw new Error('Please provide a callback function as 2nd argument.');
    }

    if (options.url.endsWith('/')) {
        options.url = options.url.slice(0, -1);
    }
    debuglog(`${MODULE_NAME}.scan() reorganized options:`, options);

    const npmScanner = new NpmScanner(options);
    const meteorScanner = new MeteorScanner(options);

    npmScanner.scan().then((scanResult) => {
        if (options.scanMeteor) {
            debuglog(`${MODULE_NAME}.scan() scanMeteor set: scanning meteor dependencies`);
            return meteorScanner.scan(scanResult.module).then((meteorScanResult) => {
                // remove dependency introduced by local package.json (this will never be released)
                const npmDependencies = scanResult.dependencies.length === 1
                    ? scanResult.dependencies[0].dependencies : scanResult.dependencies;
                Array.prototype.push.apply(meteorScanResult.dependencies, npmDependencies);
                return meteorScanResult;
            });
        }
        return scanResult;
    }).then((scanResult) => {
        if (options.simulate) {
            stdlog(`${MODULE_NAME}.scan():${npmScanner.name} simulating, nothing transferred:`);
            return undefined;
        }
        return scanResult;
    }).then((scanResult) => {
        if (options.saveAs) {
            const date = new Date();
            let printData = JSON.stringify(scanResult, 0, 2);
            let printExt = 'json';
            if (options.saveAsFormat) {
                const allowedTypes = ['json', 'spdx', 'cydx'];
                if (allowedTypes.indexOf(options.saveAsFormat) > 0) {
                    printData = JSON.stringify(Convertor.scanTo(options.saveAsFormat, scanResult), 0, 2);
                    printExt = options.saveAsFormat;
                }
            }
            const formatedDate = date.toISOString().substr(0, 19).split(':').join('-').split('T').join('-');
            fs.writeFileSync(`${options.saveAs || 'ts-scan'}-${formatedDate}.${printExt}`, printData);
        }
        return scanResult;
    }).then((scanResult) => {
        if (scanResult) {
            return npmScanner.transfer(scanResult);
        }
        return undefined;
    }).then(
        (transferResult) => {
            if (transferResult) {
                stdlog(`${MODULE_NAME}.scan():${npmScanner.name} successfully transferred scan to server:${
                    JSON.stringify(transferResult)}`);
            }
            debuglog(`${MODULE_NAME}scan(): finished`, transferResult);
            scanDone(true);
        },
        (error) => {
            stdlog(`${MODULE_NAME}.scan():${npmScanner.name} error transferring scan:${JSON.stringify(error)}`);
            return Promise.reject();
        }
    )
        .catch((error) => {
            if (error) stdlog(`${MODULE_NAME}scan(): error`, error);
            scanDone(false);
        });
}

/* eslint-disable func-names, prefer-rest-params */
function promisifyFunc(func) {
    if (typeof (func) === 'function') {
        return function () {
            const args = Array.from(arguments);
            const self = this;

            return new Promise((resolve, reject) => {
                args.push((error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
                func.apply(self, args);
            });
        };
    }
    return func;
}
/* eslint-enable func-names, prefer-rest-params */

function promisify(scanner) {
    if (scanner && scanner.prototype) {
        scanner.prototype.scan = promisifyFunc(scanner.prototype.scan);
        scanner.prototype.transfer = promisifyFunc(scanner.prototype.transfer);
    }
    return scanner;
}
