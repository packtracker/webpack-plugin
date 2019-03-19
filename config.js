const { execSync } = require('child_process')

class Config {
  constructor (options = {}) {
    this.upload = options.upload || process.env.PT_UPLOAD === 'true' || false

    this.CI = {
      detected: false,
      branch: null,
      commit: null,
      server: options.ci_server || process.env.PT_CI_SERVER || 'default'
    }

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

      this.CI.server = validateCI(this.CI.server)

      if (process.env.CI === 'true' || process.env.JENKINS_URL ||
        this.CI.server !== 'default') {
        this.CI = detectCI(this.CI)
      }

      this.branch = options.branch ||
        process.env.PT_BRANCH ||
        (this.CI.detected && this.CI.branch) ||
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
        (this.CI.detected && this.CI.commit) ||
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

function detectCI (CI) {
  const CI_EV = {
    circleci: { branch: process.env.CIRCLE_BRANCH, commit: process.env.CIRCLE_SHA1 },
    codeship: { branch: process.env.CI_BRANCH, commit: process.env.CI_COMMIT_ID },
    jenkins: { branch: process.env.GIT_BRANCH, commit: process.env.GIT_COMMIT },
    semaphore: { branch: process.env.BRANCH_NAME, commit: process.env.REVISION },
    travis: { branch: process.env.TRAVIS_PULL_REQUEST_BRANCH || process.env.TRAVIS_BRANCH,
      commit: process.env.TRAVIS_PULL_REQUEST_SHA || process.env.TRAVIS_COMMIT }
  }

  if (process.env.JENKINS_URL) {
    CI.server = CI.server || 'jenkins'
  } else if (process.env.TRAVIS === 'true') {
    CI.server = CI.server || 'travis'
  } else if (process.env.CIRCLECI === 'true') {
    CI.server = CI.server || 'circleci'
  } else if (process.env.SEMAPHORE === 'true') {
    CI.server = CI.server || 'semaphore'
  } else if (process.env.CI_NAME === 'codeship') {
    CI.server = CI.server || 'codeship'
  }

  CI.server = validateCI(CI.server)

  if (CI.server !== 'default') {
    CI.detected = true
    CI.branch = CI_EV[CI.server].branch
    CI.commit = CI_EV[CI.server].commit
  }

  return CI
}

function validateCI (server) {
  server = server.toLowerCase()

  if (!`circleci,
        codeship,
        jenkins,
        semaphore,
        travis,
        default`.includes(server)) {
    server = 'default'
  }
  return server
}

module.exports = Config
