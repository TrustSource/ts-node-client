# TrustSource ts-node-client

[![Version](https://img.shields.io/npm/v/ts-node-client.svg)](http://npm.im/ts-node-client)
[![Downloads](https://img.shields.io/npm/dm/ts-node-client.svg)](http://npm-stat.com/charts.html?package=ts-node-client)
[![Downloads](https://img.shields.io/npm/dt/ts-node-client.svg)](http://npm-stat.com/charts.html?package=ts-node-client)
[![Apache-2.0 License](https://img.shields.io/npm/l/ts-node-client?style=flat-square)](http://opensource.org/licenses/Apache-2.0)

[![npm package](https://nodei.co/npm/ts-node-client.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ts-node-client/)

> TrustSource node client - node module to transfer dependency information to TrustSource server.

## Release 3.0.0
Package now is not including `npm`. This was done due to missing programmatic API in npm >= 8.0.0 and in order to skip deprecated dependencies

This change affects structure of scans, but improve tool.


## Requirements
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
  "url": "https://app.trustsource.io",
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

## [DEPRECATED] Changelog 

#### 3.0.*
- `npm.ls` cli -> `package-lock.json` parse
- npm removed
- updated dependencies

#### 2.1.*
- Migrate 1.6.* - 1.8.* changes to version 2.1

#### 2.0.*
- Support new scan tool and fix problem with programmatic API for >= npm@8.0.0
- Stop usage of [`global-npm`](https://github.com/dracupid/global-npm) until we find new resolution
- Get back `npm` as local dependency

#### 1.8.*
- SBOM
- **--saveAs** and **--saveAsFormat**
- Bump minimist from 1.2.5 to 1.2.6
- Bump urijs from 1.19.10 to 1.19.11
- replace packageurl-js with simple local function
- improve docs

#### 1.7.*
- request -> axios
- fix dependencies
- doc fixes

#### 1.6.*
- **--breakOnWarnings** and **--breakOnViolations**
- Bump devDependencies

#### 1.5.*
- Describe `Error: The programmatic API was removed in npm v8.0.0`
- Bump devDependencies
- Introduce sonarjs

#### 1.4.*
- Bump glob-parent from 5.1.1 to 5.1.2
- Bump path-parse from 1.0.6 to 1.0.7
- Bump lodash from 4.17.19 to 4.17.21
- Bump y18n from 4.0.0 to 4.0.1
- Added:
    - option **--includeDevDependencies**. It is allow to scan dev dependencies

#### 1.3.*
- Use [`global-npm`](https://github.com/dracupid/global-npm) (meaning `npm` is no longer a dependency of `ts-node-client`)

#### 1.2.*
- Added:
    - option **--brakeOnViolations**. It is fail build in case any violations after scan transferred.
    - option **--brakeOnWarnings**. It is fail build in case any warning after scan transferred.

#### 1.1.*
- userName is not required param for scans
- Support usage of scan meta param binaryLinks inside Options definition

#### 1.0.*
- Node JS and dependencies updates "node": ">= 8.12.0"

#### 0.3.*
- Improve variable usage and tasks migration
- Support usage of scan meta params: branch and tag inside Options definition
- Skip npmDependency without names
- Update travis config
- Update dependency to resolve vulnerabilities

#### 0.2.*
- Added proxy support and config
- Update travis config
- Updated README.md with `app.trustsource.io`
- Updated default url to `app.trustsource.io`
- Added windows support
- Fixed json 
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
