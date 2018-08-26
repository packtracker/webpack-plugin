# packtracker.io webpack plugin

[![Build Status](https://travis-ci.org/packtracker/webpack-plugin.svg?branch=master)](https://travis-ci.org/packtracker/webpack-plugin)

This plugin is designed to report your webpack build stats to the [packtracker.io](https://packtracker.io) service.

## Basic Usage

In order to get your data flowing, all you need to do is install and configure our Webpack plugin.

```
npm install --save @packtracker/webpack-plugin
```

Then in your Webpack configuration include the plugin (along with your project token).

For example,
```js
const PacktrackerPlugin = require('@packtracker/webpack-plugin')

module.exports = {
  plugins: [
    new PacktrackerPlugin({
      project_token: '<your packtracker project token>',
      report: process.env.NODE_ENV === 'production'
    })
  ]
}
```

The report option above tells the plugin when it is time to report your build stats. Commonly this is best ran when building your production assets in your CI environment or during deployment. If the report option is false, the plugin will do nothing.  This basic configuration infers a lot of information from your local git repository, to take more control of how we get this info take a look at the option reference below.

All of the options can be set [via argument to the plugin, environment variable, or allowed to query your git repository.](https://github.com/packtracker/webpack-plugin/blob/777fa84/index.js#L5-L37)
