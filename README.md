# TrustSource ts-node-client

[![Travis build status](https://travis-ci.org/TrustSource/ts-node-client.svg?branch=master)](https://travis-ci.org/TrustSource/ts-node-client)
[![Version](https://img.shields.io/npm/v/ts-node-client.svg)](http://npm.im/ts-node-client)
[![Downloads](https://img.shields.io/npm/dm/ts-node-client.svg)](http://npm-stat.com/charts.html?package=ts-node-client)
[![Downloads](https://img.shields.io/npm/dt/ts-node-client.svg)](http://npm-stat.com/charts.html?package=ts-node-client)
[![Apache-2.0 License](https://img.shields.io/npm/l/ts-node-client?style=flat-square)](http://opensource.org/licenses/Apache-2.0)

[![npm package](https://nodei.co/npm/ts-node-client.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ts-node-client/)

TrustSource node client

> node module to transfer dependency information to TrustSource server.

## Requirements

* node >= 8.9.0
* npm < 8.0.0

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
  "url": "https://app.trustsource.io",
  "project": "Project Description"
}

```

Usage
=====

You also may initiate transfer to TrustSource server manually by executing following command via terminal:

```
node_modules/.bin/ts-node-client
node_modules/.bin/ts-node-client -k apiKey -p Project
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
  --config, -c    Config path                                        [default: null]
  --proxy         Proxy url like 'https://user:password@host:port'   [default: null]
  --version, -v   Prints a version                                   [default: false]
  --saveAs, -o              Save as file (file name prefix)          [default: null]
  --saveAsFormat, --of      Save as format (scan / cydx / spdx)      [default: null]
  --debug                                                            [default: null]
  --simulate                                                         [default: null]
  --includeDevDependencies                                           [default: null]
  --meteor                                                           [default: null]
  --breakOnWarnings                                                  [default: null]
  --breakOnViolations                                                [default: null]
  --help          Prints a usage statement                           [boolean]
```

## Software bill of materials

[View SBOM  <img alt="TrustSource" src="https://app.trustsource.io/logo.png" width="70"/>](https://app.trustsource.io/api/v1/public-BoM/ae0832c6-5a55-4aa8-8c45-75528d0833fb) 


## Known problems

####  Error: The programmatic API was removed in npm v8.0.0
You should upgrade to later versions of ts-node-client

## Changelog

#### 1.8.*
- SBOM
- **--saveAs** and **--saveAsFormat**

#### 1.7.*
- request -> axios
- fix dependencies
- doc fixes

#### 1.6.0
- **--breakOnWarnings** and **--breakOnViolations**
- Bump devDependencies

#### 1.5.2
- Describe `Error: The programmatic API was removed in npm v8.0.0`

#### 1.5.1
- Bump devDependencies
- Introduce sonarjs

#### 1.4.3
- Bump glob-parent from 5.1.1 to 5.1.2
- Bump path-parse from 1.0.6 to 1.0.7

#### 1.4.2
- Bump lodash from 4.17.19 to 4.17.21

#### 1.4.1
- Bump y18n from 4.0.0 to 4.0.1

#### 1.4.0
- Added:
    - option **--includeDevDependencies**. It is allow to scan dev dependencies

#### 1.3.1
- Use [`global-npm`](https://github.com/dracupid/global-npm) (meaning `npm` is no longer a dependency of `ts-node-client`)

#### 1.2.3
- Added:
    - option **--brakeOnViolations**. It is fail build in case any violations after scan transferred.
    - option **--brakeOnWarnings**. It is fail build in case any warning after scan transferred.

#### 1.1.2
- userName is not required param for scans
- Support usage of scan meta param binaryLinks inside Options definition


#### 1.0.0
- Node JS and dependencies updates "node": ">= 8.12.0"

#### 0.3.4 - 0.3.6
- Improve variable usage and tasks migration

#### 0.3.3
- Support usage of scan meta params: branch and tag inside Options definition

#### 0.3.2
- Skip npmDependency without names

#### 0.3.1
- Update travis config

#### 0.3.0
- Update dependency to resolve vulnerabilities

#### 0.2.5
- Added proxy support and config

#### 0.2.4
- Update travis config

#### 0.2.3
- Updated README.md with `app.trustsource.io`

#### 0.2.2
- Updated default url to `app.trustsource.io`

#### 0.2.1
- Added windows support
- Fixed json 

#### 0.2.0
- **Removed:**
    - options: **--credentials** and **--credentialsFile** instead you should use **--config**.
    - option **--baseUrl** instead you should use **--url**.
- Added:
    - option **--config**. It is similar to credentials, but it will contain any config information.
    - option **--url**. It is similar to baseUrl.
    - option **--apiKey** and **--userName** so it will be unnecessary to create `.tsrc.json` file.
    - options **--version** and **--help**.
    - options shortcut.

## License
[Apache-2.0](https://github.com/TrustSource/ts-node-client/blob/master/LICENSE)
