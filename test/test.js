/* globals jest, describe, test, beforeEach, expect */

const path = require('path')
const webpack2 = require('webpack-2')
const webpack3 = require('webpack-3')
const webpack4 = require('webpack')
const tiny = require('tiny-json-http')

jest.mock('tiny-json-http')

const PacktrackerPlugin = require('../')

tiny.post.mockResolvedValue({
  body: {
    project_id: 'project-id',
    upload_url: 'http://upload.url'
  }
})

tiny.put.mockResolvedValue({
  body: {}
})

const plugin = new PacktrackerPlugin({
  report: true,
  project_token: 'abc123',
  host: 'https://fake.host',
  branch: 'master',
  author: 'jane@doe.com',
  message: 'This is a commit message',
  commit: '07db3813141ca398ffe8cd07cf71769195abe8a3',
  committed_at: '1534978373',
  prior_commit: '4a47653d5fc58fc62757c6b815e715ec77c8ee2e'
})

describe('PacktrackerPlugin', () => {
  test('webpack@2', (done) => {
    webpack2({
      entry: path.resolve(__dirname, 'files/entry.js'),
      output: {
        path: path.resolve(__dirname, 'files/output'),
        filename: 'bundle.js'
      },
      plugins: [ plugin ]
    }, (err, stats) => {
      if (err) return done(err)
      expectations(stats)
      done()
    })
  })

  test('webpack@3', (done) => {
    webpack3({
      entry: path.resolve(__dirname, 'files/entry.js'),
      output: {
        path: path.resolve(__dirname, 'files/output'),
        filename: 'bundle.js'
      },
      plugins: [ plugin ]
    }, (err, stats) => {
      if (err) return done(err)
      expectations(stats)
      done()
    })
  })

  test('webpack@4', (done) => {
    webpack4({
      entry: path.resolve(__dirname, 'files/entry.js'),
      output: {
        path: path.resolve(__dirname, 'files/output'),
        filename: 'bundle.js'
      },
      plugins: [ plugin ]
    }, (err, stats) => {
      if (err) return done(err)
      expectations(stats)
      done()
    })
  })
})

function expectations (stats) {
  stats = stats.toJson({ source: false })
  expect(tiny.post).toHaveBeenCalledWith({
    url: `https://fake.host/generate-upload-url`,
    headers: { 'Accept': 'application/json' },
    data: {
      project_token: 'abc123',
      commit_hash: '07db3813141ca398ffe8cd07cf71769195abe8a3'
    }
  })

  expect(tiny.put).toHaveBeenCalledWith({
    url: 'http://upload.url',
    headers: { 'Content-Length': expect.any(Number) },
    data: {
      packer: 'webpack@' + stats.version,
      commit: '07db3813141ca398ffe8cd07cf71769195abe8a3',
      committed_at: 1534978373,
      branch: 'master',
      author: 'jane@doe.com',
      message: 'This is a commit message',
      prior_commit: '4a47653d5fc58fc62757c6b815e715ec77c8ee2e',
      project_id: 'project-id',
      stats: expect.any(Object)
    }
  })
}
