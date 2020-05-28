const { execSync } = require('child_process')
const OptionsError = require('./options_error')
const logger = require('./logger')

class Config {
  constructor (options = {}) {
    this.upload = options.upload || process.env.PT_UPLOAD === 'true' || false
    if (!this.upload) return

    this.projectToken = options.project_token || process.env.PT_PROJECT_TOKEN
    this.excludeAssets = retrieveExcludeAssets(options)
    this.statOptions = { source: false, excludeAssets: this.excludeAssets }

    this.host = options.host ||
      process.env.PT_HOST ||
      'https://api.packtracker.io'

    this.failBuild = options.fail_build ||
      process.env.PT_FAIL_BUILD === 'true' ||
      false

    this.branch = options.branch ||
      process.env.PT_BRANCH ||
      retrieveConfig('git rev-parse --abbrev-ref HEAD', 'branch')

    this.author = options.author ||
      process.env.PT_AUTHOR ||
      retrieveConfig('git log --format="%aE" -n 1 HEAD', 'author')

    this.message = options.message ||
      process.env.PT_MESSAGE ||
      retrieveConfig('git log --format="%B" -n 1 HEAD', 'message')

    this.commit = options.commit ||
      process.env.PT_COMMIT ||
      retrieveConfig('git rev-parse HEAD', 'commit')

    this.committedAt = options.committed_at ||
      process.env.PT_COMMITTED_AT ||
      retrieveConfig('git log --format="%ct" -n 1 HEAD', 'committed_at')

    this.priorCommit = options.prior_commit ||
      process.env.PT_PRIOR_COMMIT ||
      retrieveConfig('git rev-parse HEAD^', 'prior_commit')

    if (!this.commit) {
      logger('required configuration attribute `commit` was not set.')
    }

    if (!this.branch) {
      logger('required configuration attribute `branch` was not set.')
    }

    if (!this.committedAt) {
      logger('required configuration attribute `committed_at` was not set.')
    }

    if (!this.commit || !this.branch || !this.committedAt) {
      logger('config validation failed, throwing options error')
      throw new OptionsError()
    }

    if (this.branch === 'HEAD') {
      throw new Error('packtracker: Not able to determine branch name with git, please provide it manually via config options: https://docs.packtracker.io/faq#why-cant-the-plugin-determine-my-branch-name')
    }

    logger('configured successfully')
  }
}

function retrieveConfig (command, configName) {
  try {
    logger(`${configName} not explicitly provided, falling back to retrieve it from from git`)
    return execSync(command).toString().trim()
  } catch (error) {
    logger(`ooops, looks like we had trouble trying to retrieve the '${configName}' from git`)
    console.error(error.message)
    throw new OptionsError()
  }
}

function retrieveExcludeAssets (options) {
  let exclusion

  if (process.env.PT_EXCLUDE_ASSETS) {
    exclusion = new RegExp(process.env.PT_EXCLUDE_ASSETS)
  }

  if (options.exclude_assets) {
    exclusion = options.exclude_assets
  }

  if (exclusion) {
    logger(`excluding assets using ${exclusion}`)
  }

  return exclusion
}

module.exports = Config
