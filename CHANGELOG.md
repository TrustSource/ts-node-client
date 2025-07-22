# ts-node-client

## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## 3.4.4 - 2025-07-22

### Fixed
* 403 request error


## 3.4.3 - 2025-07-22

### Changed
* bump dependencies
* full url optional param
* changelog moved


## 3.4.2 - 2024-08-20

### Changed
* docs update


## 3.4.1 - 2024-08-13

### Fixed
* axios 1.7.2 allows SSRF via unexpected behavior where requests for path relative URLs get processed as protocol relative URLs.

### Changed
* update to cyclonedx version 1.6


## 3.4.0 - 2024-06-18

### Changed
* switch to API v2


## 3.3.3 - 2024-04-01

### Fixed
* package-lock.json parser will fix sub-dependencies names


## 3.3.2 - 2024-03-29

### Changed
* update GithubActions to node 20.x


## 3.3.1 - 2024-03-29

### Changed
* automate dependency scans


## 3.3.0 - 2024-03-27

### Changed
* migrated to packageurl-js@1.2.1
* Bump dependencies


## 3.2.5 - 2024-03-21

### Changed
* Bump dependencies


## 3.2.4 - 2024-01-17

### Changed
* Bump dependencies


## 3.2.3 - 2023-11-24

### Fixed
* Fallback missing versions to `0.0.0`

### Changed
* Bump `axios` to fix vulnerabilities


## 3.2.2 - 2023-09-06

### Added
* Automatically publish releases from main branch


## 3.2.1 - 2023-08-14

### Fixed
* --includeDevDependencies false now properly disables devDependencies


## 3.2.0 - 2023-08-01

### Added
* support package-lock.json v.3

### Changed
* bump dependencies


## 3.1.0 - 2023-04-20

### Added
* support for yarn v2+ lock files
  
### Changed
* project migrated to yarn 3.5


## 3.0.1 - 2023-02-08

### Changed
* docs updated


## 3.0.0 - 2023-02-08

### Changed
* `npm.ls` cli -> `package-lock.json` or `package.json` or `yarn.lock` parse
* npm removed
* updated dependencies


## 2.1.3 - 2022-12-26

### Changed
* Migrate versions of dependencies


## 2.0.*

### Changed
* Support new scan tool and fix problem with programmatic API for >= npm@8.0.0
* Stop usage of [`global-npm`](https://github.com/dracupid/global-npm) until we find new resolution
* Get back `npm` as local dependency


## 1.8.*

### Changed
* SBOM
* **--saveAs** and **--saveAsFormat**
* Bump minimist from 1.2.5 to 1.2.6
* Bump urijs from 1.19.10 to 1.19.11
* replace packageurl-js with simple local function
* improve docs


## 1.7.*

### Changed
* request -> axios
* fix dependencies
* doc fixes


## 1.6.*

### Changed
* **--breakOnWarnings** and **--breakOnViolations**
* Bump devDependencies


## 1.5.*

### Changed
* Describe `Error: The programmatic API was removed in npm v8.0.0`
* Bump devDependencies
* Introduce sonarjs


## 1.4.*

### Changed
* Bump glob-parent from 5.1.1 to 5.1.2
* Bump path-parse from 1.0.6 to 1.0.7
* Bump lodash from 4.17.19 to 4.17.21
* Bump y18n from 4.0.0 to 4.0.1

### Added
* option **--includeDevDependencies**. It is allow to scan dev dependencies


## 1.3.*

### Changed
* Use [`global-npm`](https://github.com/dracupid/global-npm) (meaning `npm` is no longer a dependency of `ts-node-client`)


## 1.2.*

### Added
* option **--brakeOnViolations**. It is fail build in case any violations after scan transferred.
* option **--brakeOnWarnings**. It is fail build in case any warning after scan transferred.


## 1.1.*

### Changed
* userName is not required param for scans
* Support usage of scan meta param binaryLinks inside Options definition


## 1.0.*

### Changed
* Node JS and dependencies updates "node": ">= 8.12.0"


## 0.3.*

### Changed
* Improve variable usage and tasks migration
* Support usage of scan meta params: branch and tag inside Options definition
* Skip npmDependency without names
* Update travis config
* Update dependency to resolve vulnerabilities


## 0.2.*

### Changed
* Added proxy support and config
* Update travis config
* Updated README.md with `app.trustsource.io`
* Updated default url to `app.trustsource.io`
* Added windows support
* Fixed json

### Removed
* options: **--credentials** and **--credentialsFile** instead you should use **--config**.
* option **--baseUrl** instead you should use **--url**.

### Added
* option **--config**. It is similar to credentials, but it will contain any config information.
* option **--url**. It is similar to baseUrl.
* option **--apiKey** and **--userName** so it will be unnecessary to create `.tsrc.json` file.
* options **--version** and **--help**.
* options shortcut.
