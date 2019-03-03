#! /usr/bin/env node

const args = require('minimist')(process.argv)
const path = require('path')
const Config = require('./config')
const Upload = require('./upload')

const statsJson = require(args.stats)
const outputPath = args['output-path'] || path.dirname(args.stats)

const config = new Config({ fail_build: true })
const upload = new Upload(config)

upload.process(statsJson, outputPath)
  .then(() => {
    console.log('Stats Uploaded!')
  })
  .catch((err) => {
    console.error('There was a problem uploading your stats.')
    console.error(err)
  })
