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

      expect(plugin.upload).toBe(false)
      expect(plugin.host).toBe(undefined)
      expect(plugin.fail_build).toBe(undefined)
      expect(plugin.branch).toBe(undefined)
      expect(plugin.author).toBe(undefined)
      expect(plugin.message).toBe(undefined)
      expect(plugin.commit).toBe(undefined)
      expect(plugin.committed_at).toBe(undefined)
      expect(plugin.priorCommit).toBe(undefined)
      expect(execSync).not.toHaveBeenCalled()
    })

    test('default uploading', () => {
      execSync.mockReturnValue('default')

      const plugin = new PacktrackerPlugin({
        upload: true,
        project_token: 'abc123'
      })

      expect(plugin.upload).toBe(true)
      expect(plugin.projectToken).toEqual('abc123')
      expect(plugin.host).toEqual('https://api.packtracker.io')
      expect(plugin.fail_build).toEqual(false)
      expect(plugin.branch).toEqual('default')
      expect(plugin.author).toEqual('default')
      expect(plugin.message).toEqual('default')
      expect(plugin.commit).toEqual('default')
      expect(plugin.committed_at).toEqual('default')
      expect(plugin.priorCommit).toEqual('default')
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

      const plugin = new PacktrackerPlugin()

      expect(plugin.upload).toBe(true)
      expect(plugin.projectToken).toEqual('abc123')
      expect(plugin.host).toEqual('http://custom.host')
      expect(plugin.fail_build).toEqual(true)
      expect(plugin.branch).toEqual('branch')
      expect(plugin.author).toEqual('email@author.com')
      expect(plugin.message).toEqual('Some message.')
      expect(plugin.commit).toEqual('07db3813141ca398ffe8cd07cf71769195abe8a3')
      expect(plugin.committed_at).toEqual('1534978373')
      expect(plugin.priorCommit).toEqual('4a47653d5fc58fc62757c6b815e715ec77c8ee2e')
      expect(execSync).not.toHaveBeenCalled()
    })

    test('arguments', () => {
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
        prior_commit: '4a47653d5fc58fc62757c6b815e715ec77c8ee2e'
      })

      expect(plugin.upload).toBe(true)
      expect(plugin.projectToken).toEqual('abc123')
      expect(plugin.host).toEqual('https://fake.host')
      expect(plugin.fail_build).toEqual(true)
      expect(plugin.branch).toEqual('master')
      expect(plugin.author).toEqual('jane@doe.com')
      expect(plugin.message).toEqual('This is a commit message')
      expect(plugin.commit).toEqual('07db3813141ca398ffe8cd07cf71769195abe8a3')
      expect(plugin.committed_at).toEqual('1534978373')
      expect(plugin.priorCommit).toEqual('4a47653d5fc58fc62757c6b815e715ec77c8ee2e')
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
