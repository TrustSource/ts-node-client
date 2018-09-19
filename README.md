# ecs-node-client

[![Travis build status](https://travis-ci.org/eacg-gmbh/ecs-node-client.svg?branch=master)](https://travis-ci.org/eacg-gmbh/ecs-node-client)
[![Version](https://img.shields.io/npm/v/ecs-node-client.svg)](http://npm.im/ecs-node-client)
[![Downloads](https://img.shields.io/npm/dm/ecs-node-client.svg)](http://npm-stat.com/charts.html?package=ecs-node-client)
[![Downloads](https://img.shields.io/npm/dt/ecs-node-client.svg)](http://npm-stat.com/charts.html?package=ecs-node-client)
[![MIT License](https://img.shields.io/npm/l/check-dependencies.svg?style=flat-square)](http://opensource.org/licenses/MIT)

[![npm package](https://nodei.co/npm/ecs-node-client.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ecs-node-client/)

EACG Code Scan node client

> node module to transfer dependency information to ECS server.

## Requirements

* debuglog >= 1.0.1
* npm >= 4.1.1
* request >= 2.79.0
* semver >= 5.3.0
* yargs >= 8.0.2

## Installation
Run: `npm install ecs-node-client`

You can add `install_and_scan` script to the package.json file to install and transfer dependency information using one command `npm run install_and_scan`:

```
"scripts": {
  "install_and_scan": "npm install && ecs-node-client -u userName -k apiKey -p Project"
},
```

To store your credentials for automated transfer you may create `.ecsrc.json` in your project directory or in your home directory to set credentials globally (not recommended!)

`.ecsrc.json` example:

```
{
  "userName": "UserName",
  "apiKey": "apiKey",
  "url": "url",
  "project": "Project Description"
}

```

Usage
=====

You also may initiate transfer to ECS server manually by executing following command via terminal:

```
node_modules/.bin/ecs-node-client
node_modules/.bin/ecs-node-client -u userName -k apiKey -p Project
node_modules/.bin/ecs-node-client -c config.json
```
```
npm / node module to transfer dependency information to ECS server.

Options:
  --userName, -u  UserName                                       [default: null]
  --apiKey, -k    apiKey                                         [default: null]
  --project, -p   Project name                                   [default: null]
  --url           url                                            [default: null]
  --config, -c    Config path                                    [default: null]
  --version, -v   Prints a version                              [default: false]
  --debug         debug                                         [default: false]
  --simulate      simulate                                      [default: false]
  --meteor        meteor                                        [default: false]
  --help          Prints a usage statement                             [boolean]
```

## Changelog

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
    - option **--config**. It is similar to credentials but it will contains any config information.
    - option **--url**. It is similar to baseUrl.
    - option **--apiKey** and **--userName** so it will be unnecessary to create `.ecsrc.json` file.
    - options **--version** and **--help**.
    - options shortcuts.

## License
[MIT](https://github.com/eacg-gmbh/ecs-node-client/blob/master/LICENSE)
