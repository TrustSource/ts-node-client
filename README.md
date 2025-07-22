# TrustSource ts-node-client

[![Version](https://img.shields.io/npm/v/ts-node-client.svg)](http://npm.im/ts-node-client)
[![Downloads](https://img.shields.io/npm/dm/ts-node-client.svg)](http://npm-stat.com/charts.html?package=ts-node-client)
[![Downloads](https://img.shields.io/npm/dt/ts-node-client.svg)](http://npm-stat.com/charts.html?package=ts-node-client)
[![Apache-2.0 License](https://img.shields.io/npm/l/ts-node-client?style=flat-square)](http://opensource.org/licenses/Apache-2.0)

[![npm package](https://nodei.co/npm/ts-node-client.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ts-node-client/)

> TrustSource node client - node module to transfer dependency information to TrustSource server.

## Release 3.4.0
Migrated to TrustSource API v2. Please ensure your `url` is updated to `https://api.trustsource.io`. 

> PLEASE NOTE: API v1 is meanwhile deprecated. We plan to seize its functionality in September 30th, 2024. Starting from June, users of APIv1 will receive a deprecation notice. If you feel that this timeframe is too tough for you, please reach out to your engagement manager as soon as possible to clarify further proceedings.

## Release 3.2.0
Package now support package-lock.json v.3

## Release 3.1.0
Package now support yarn v.2+

## Release 3.0.0
Package now is not including `npm` anymore. The addition has been done due to missing programmatic API in npm >= 8.0.0 and in order to skip deprecated dependencies

This change affects the structure of scans slightly, but it heavily improves the scanner.

## Requirements
* node >= 12.0.0 use **ts-node-client@3.1.+***

## Older versions
* node >= 8.9.0
* npm < 8.0.0 use **ts-node-client@1.***
* npm >= 8.0.0 use **ts-node-client@2.***

## Installation
Run: `npm install --save-dev ts-node-client` or `yarn add --dev ts-node-client`

You can add `install_and_scan` script to the package.json file to install and transfer dependency information using one command `npm run install_and_scan`:

```
"scripts": {
  "install_and_scan": "npm install && ts-node-client -k apiKey -p Project"
},
```

To store your credentials for automated transfer you may create `.tsrc.json` in your project directory or in your home directory to set credentials globally (not recommended!)

`.tsrc.json` example:

```
{
  "apiKey": "apiKey",
  "url": "https://api.trustsource.io",
  "project": "Project Description"
}

```

Usage
=====

You also may initiate transfer to TrustSource server manually by executing following command via terminal:

```
node_modules/.bin/ts-node-client
node_modules/.bin/ts-node-client -k apiKey -p Project --breakOnWarnings false --breakOnViolations true
node_modules/.bin/ts-node-client -c config.json 
```
```
npm / node module to transfer dependency information to TrustSource server.

Options:
  --apiKey, -k    apiKey                                             [default: null]
  --project, -p   Project name                                       [default: null]
  --branch, -b    Scan branch                                        [default: null]
  --tag, -t       Scan tag                                           [default: null]
  --binaryLinks   Binary links separated by comma                    [default: null]
  --url           url                                                [default: null]
  --fullUrl       fullUrl                                            [default: null]
  --config, -c    Config path                                        [default: null]
  --proxy         Proxy url like 'https://user:password@host:port'   [default: null]
  --version       Prints a version                                   [default: null]
  --saveAs, -o              Save as file (file name prefix)          [default: null]
  --saveAsFormat, -f      Save as format (scan / cydx / spdx)       [default: null]
  --debug                                                            [default: null]
  --simulate                                                         [default: null]
  --includeDevDependencies                                           [default: null]
  --meteor                                                           [default: null]
  --breakOnWarnings                                                  [default: null]
  --breakOnViolations                                                [default: null]
  --help          Prints a usage statement                           [boolean]

```
PLEASE NOTE: if you want to pass param into function
you should add value, for example:

`--breakOnViolations true` or `--saveAs sbom`

## Software bill of materials

[View SBOM  <img alt="TrustSource" src="https://app.trustsource.io/logo.png" width="70"/>](https://app.trustsource.io/api/v1/public-BoM/ae0832c6-5a55-4aa8-8c45-75528d0833fb) 

## Known problems

####  Error: The programmatic API was removed in npm v8.0.0
You should upgrade to 2.* versions of ts-node-client

## Changelog available inside `CHANGELOG.md`

## License
[Apache-2.0](https://github.com/TrustSource/ts-node-client/blob/master/LICENSE)
