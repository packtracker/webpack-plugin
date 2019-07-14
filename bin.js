#! /usr/bin/env node

const args = require('minimist')(process.argv)
const { resolve, dirname } = require('path')
const fs = require('fs')
const Config = require('./config')
const Upload = require('./upload')
const logger = require('./logger')

const statsFilePath = resolve(args['stats'])
const outputPath = args['output-path'] || dirname(statsFilePath)

let stats

try {
  logger(`retrieving stats from ${statsFilePath}`)
  stats = JSON.parse(fs.readFileSync(statsFilePath, 'utf8'))
} catch (err) {
  logger('there was a problem reading your stats file.')
  console.error(err)
  process.exit(1)
}

const config = new Config({ upload: true, fail_build: true })
const upload = new Upload(config)

upload.process(stats, outputPath)
  .then(() => {
    logger('stats uploaded successfully')
    process.exit(0)
  })
  .catch((err) => {
    logger('there was a problem uploading your stats.')
    console.error(err)
    process.exit(1)
  })
