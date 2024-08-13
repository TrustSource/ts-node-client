# ts-node-client

## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## 3.4.1 - 2024-08-13

### Fixed
* axios 1.7.2 allows SSRF via unexpected behavior where requests for path relative URLs get processed as protocol relative URLs.


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
