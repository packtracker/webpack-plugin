<p align="center">
  <img width="250" height="250" src="https://user-images.githubusercontent.com/401520/45194786-2554ac00-b21a-11e8-9575-68407609d8e4.png">
</p>

# packtracker.io webpack plugin

[![Build Status](https://travis-ci.org/packtracker/webpack-plugin.svg?branch=master)](https://travis-ci.org/packtracker/webpack-plugin)
[![Coverage Status](https://coveralls.io/repos/github/packtracker/webpack-plugin/badge.svg?branch=master)](https://coveralls.io/github/packtracker/webpack-plugin?branch=master)

This plugin is designed to upload your webpack build stats to the [packtracker.io](https://packtracker.io) service.

## Installing

Once you have your [project created]() on [packtracker.io](https://app.packtracker.io), and a `project_token` in hand, you can get your data flowing by installing and configuring this plugin.

```sh
npm install --save-dev @packtracker/webpack-plugin

```

## Configuration

In your webpack configuration include the plugin (along with your project token).

> If the plugin fails to upload your stats, **it will not error out your build** but it will **log output signaling the failure**.

```js
const PacktrackerPlugin = require('@packtracker/webpack-plugin')

module.exports = {
  plugins: [
    new PacktrackerPlugin({
      project_token: '<your packtracker project token>',
      upload: true
    })
  ]
}
```

The `upload` option above tells the plugin whether or not to upload your build stats when running webpack. By default, this option is set to `false` to prevent accidental uploading from your local machine. If the upload option is left `false`, the plugin will do nothing.

 Once you see your stats are uploading, it is common to only upload when building your assets in a CI environment or during deployment. You can also omit this option, and set the `PT_UPLOAD` environment variable on a per run basis to control the upload of your stats.

For example

```js
const PacktrackerPlugin = require('@packtracker/webpack-plugin')

module.exports = {
  plugins: [
    new PacktrackerPlugin({
      project_token: '<your packtracker project token>',
      upload: process.env.CI === 'true'
    })
  ]
}
```

All of the options, available to the plugin can be set [via argument to the plugin, environment variable, or allowed to query your local git repository.](https://github.com/packtracker/webpack-plugin/blob/master/index.js)
