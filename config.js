const { execSync } = require('child_process')
const OptionsError = require('./options_error')

class Config {
  constructor (options = {}) {
    this.upload = options.upload || process.env.PT_UPLOAD === 'true' || false
    if (!this.upload) return

    this.projectToken = options.project_token || process.env.PT_PROJECT_TOKEN
    this.excludeAssets = options.exclude_assets
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
      console.error('packtracker: required configuration attribute `commit` was not set.')
    }

    if (!this.branch) {
      console.error('packtracker: required configuration attribute `branch` was not set.')
    }

    if (!this.committedAt) {
      console.error('packtracker: required configuration attribute `committed_at` was not set.')
    }

    if (!this.commit || !this.branch || !this.committedAt) {
      throw new OptionsError()
    }

    if (this.branch === 'HEAD') {
      throw new Error('packtracker: Not able to determine branch name with git, please provide it manually via config options: https://docs.packtracker.io/faq#why-cant-the-plugin-determine-my-branch-name')
    }
  }
}

function retrieveConfig (command, configName) {
  try {
    return execSync(command).toString().trim()
  } catch (error) {
    console.error(`packtracker: Ooops, looks like we had trouble trying to retrieve the '${configName}' from git`)
    console.error(error.message)
    throw new OptionsError()
  }
}

module.exports = Config
