# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.2.0

### Added
- Added the uploader hostname to payload in order to identify errant uploads

### Changed
- Updated a few dependencies

## 2.1.1

### Changed
- Better error handling and visibility for failed states
- More general purpose logging (to help with debugging)

## 2.1.0

### Added
- Improved error messaging, fixing both [#5](https://github.com/packtracker/webpack-plugin/issues/5) and [#9](https://github.com/packtracker/webpack-plugin/issues/9)

### Changed
- Updated dependencies

## 2.0.1

### Changed
- Fixed a few typos [#8](https://github.com/packtracker/webpack-plugin/pull/8)

## 2.0.0

### Added
- CLI tool! for use with create react app
- new `exclude_assets` option to filter assets you don't want to track
- Improved js bundle reporting by leveraging webpack-bundle-analyzer directly

## [1.1.1]

### Changed
- [Update tiny-json-http to handle multi-byte characters in the json payload, for real](https://github.com/packtracker/webpack-plugin/pull/3/files)

## [1.1.0]

### Added
- [Add an option to fail the webpack build if the stat upload fails](https://github.com/packtracker/webpack-plugin/pull/2/files).

### Changed
- [Update tiny-json-http to handle multi-byte characters in the json payload](https://github.com/packtracker/webpack-plugin/pull/3/files)


## [1.0.1]

Initial Release
