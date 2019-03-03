const { execSync } = require('child_process')

class Config {
  constructor (options = {}) {
    this.upload = options.upload || process.env.PT_UPLOAD === 'true' || false

    if (this.upload) {
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
        runShell('git rev-parse --abbrev-ref HEAD')

      if (this.branch === 'HEAD') {
        throw new Error('Not able to determine branch name with git, please provide it manually via config options: https://docs.packtracker.io/faq#why-cant-the-plugin-determine-my-branch-name')
      }

      this.author = options.author ||
        process.env.PT_AUTHOR ||
        runShell('git log --format="%aE" -n 1 HEAD')

      this.message = options.message ||
        process.env.PT_MESSAGE ||
        runShell('git log --format="%B" -n 1 HEAD')

      this.commit = options.commit ||
        process.env.PT_COMMIT ||
        runShell('git rev-parse HEAD')

      this.committedAt = options.committed_at ||
        process.env.PT_COMMITTED_AT ||
        runShell('git log --format="%ct" -n 1 HEAD')

      this.priorCommit = options.prior_commit ||
        process.env.PT_PRIOR_COMMIT ||
        runShell('git rev-parse HEAD^')
    }
  }
}

function runShell (command) {
  return execSync(command).toString().trim()
}

module.exports = Config
