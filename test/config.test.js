/* globals jest, describe, test, beforeEach, expect */

const { execSync } = require('child_process')
const PacktrackerPlugin = require('../')

jest.mock('child_process')

describe('PacktrackerPlugin', () => {
  describe('config', () => {
    beforeEach(() => execSync.mockClear())

    test('default', () => {
      const plugin = new PacktrackerPlugin({
        project_token: 'abc123'
      })

      expect(plugin.config.upload).toBe(false)
      expect(plugin.config.excludeAssets).toBe(undefined)
      expect(plugin.config.host).toBe(undefined)
      expect(plugin.config.failBuild).toBe(undefined)
      expect(plugin.config.branch).toBe(undefined)
      expect(plugin.config.author).toBe(undefined)
      expect(plugin.config.message).toBe(undefined)
      expect(plugin.config.commit).toBe(undefined)
      expect(plugin.config.committedAt).toBe(undefined)
      expect(plugin.config.priorCommit).toBe(undefined)
      expect(plugin.config.CI).toEqual({ detected: false, branch: null, commit: null, server: 'default' })
      expect(execSync).not.toHaveBeenCalled()
    })

    test('default uploading', () => {
      execSync.mockReturnValue('default')

      process.env.CI = undefined // disable auto-detect

      const plugin = new PacktrackerPlugin({
        upload: true,
        project_token: 'abc123'
      })

      expect(plugin.config.upload).toBe(true)
      expect(plugin.config.excludeAssets).toBe(undefined)
      expect(plugin.config.projectToken).toEqual('abc123')
      expect(plugin.config.host).toEqual('https://api.packtracker.io')
      expect(plugin.config.failBuild).toEqual(false)
      expect(plugin.config.branch).toEqual('default')
      expect(plugin.config.author).toEqual('default')
      expect(plugin.config.message).toEqual('default')
      expect(plugin.config.commit).toEqual('default')
      expect(plugin.config.committedAt).toEqual('default')
      expect(plugin.config.priorCommit).toEqual('default')
      expect(plugin.config.CI).toEqual({ detected: false, branch: null, commit: null, server: 'default' })
      expect(execSync).toHaveBeenCalled()
    })

    test('env variables', () => {
      process.env.PT_UPLOAD = 'true'
      process.env.PT_PROJECT_TOKEN = 'abc123'
      process.env.PT_HOST = 'http://custom.host'
      process.env.PT_FAIL_BUILD = 'true'
      process.env.PT_BRANCH = 'branch'
      process.env.PT_AUTHOR = 'email@author.com'
      process.env.PT_MESSAGE = 'Some message.'
      process.env.PT_COMMIT = '07db3813141ca398ffe8cd07cf71769195abe8a3'
      process.env.PT_COMMITTED_AT = '1534978373'
      process.env.PT_PRIOR_COMMIT = '4a47653d5fc58fc62757c6b815e715ec77c8ee2e'
      process.env.PT_CI_SERVER = 'default'
      process.env.CI = undefined

      const plugin = new PacktrackerPlugin()

      expect(plugin.config.upload).toBe(true)
      expect(plugin.config.excludeAssets).toBe(undefined)
      expect(plugin.config.projectToken).toEqual('abc123')
      expect(plugin.config.host).toEqual('http://custom.host')
      expect(plugin.config.failBuild).toEqual(true)
      expect(plugin.config.branch).toEqual('branch')
      expect(plugin.config.author).toEqual('email@author.com')
      expect(plugin.config.message).toEqual('Some message.')
      expect(plugin.config.commit).toEqual('07db3813141ca398ffe8cd07cf71769195abe8a3')
      expect(plugin.config.committedAt).toEqual('1534978373')
      expect(plugin.config.priorCommit).toEqual('4a47653d5fc58fc62757c6b815e715ec77c8ee2e')
      expect(plugin.config.CI).toEqual({ detected: false, branch: null, commit: null, server: 'default' })
      expect(execSync).not.toHaveBeenCalled()
    })

    test('CI Auto-Detect', () => {
      process.env.CI = true
      process.env.TRAVIS = true
      process.env.TRAVIS_BRANCH = 'branch'
      process.env.TRAVIS_COMMIT = '07db3813141ca398ffe8cd07cf71769195abe8a3'

      const plugin = new PacktrackerPlugin()

      expect(plugin.config.CI).not.toEqual({ detected: false, branch: null, commit: null, server: null })
      expect(execSync).not.toHaveBeenCalled()
    })

    test('arguments', () => {
      const exclude = jest.fn()
      process.env.CI = false

      const plugin = new PacktrackerPlugin({
        upload: true,
        project_token: 'abc123',
        host: 'https://fake.host',
        fail_build: true,
        branch: 'master',
        author: 'jane@doe.com',
        message: 'This is a commit message',
        commit: '07db3813141ca398ffe8cd07cf71769195abe8a3',
        committed_at: '1534978373',
        prior_commit: '4a47653d5fc58fc62757c6b815e715ec77c8ee2e',
        exclude_assets: exclude,
        ci_server: 'default'
      })

      expect(plugin.config.upload).toBe(true)
      expect(plugin.config.excludeAssets).toBe(exclude)
      expect(plugin.config.projectToken).toEqual('abc123')
      expect(plugin.config.host).toEqual('https://fake.host')
      expect(plugin.config.failBuild).toEqual(true)
      expect(plugin.config.branch).toEqual('master')
      expect(plugin.config.author).toEqual('jane@doe.com')
      expect(plugin.config.message).toEqual('This is a commit message')
      expect(plugin.config.commit).toEqual('07db3813141ca398ffe8cd07cf71769195abe8a3')
      expect(plugin.config.committedAt).toEqual('1534978373')
      expect(plugin.config.priorCommit).toEqual('4a47653d5fc58fc62757c6b815e715ec77c8ee2e')
      expect(plugin.config.CI.server).toEqual('default')
      expect(execSync).not.toHaveBeenCalled()
    })

    test('HEAD prevention', () => {
      expect(() => {
        const plugin = new PacktrackerPlugin({ // eslint-disable-line
          upload: true,
          project_token: 'abc123',
          branch: 'HEAD'
        })
      }).toThrow()
    })
  })
})
