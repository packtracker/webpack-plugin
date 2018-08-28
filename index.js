const { execSync } = require('child_process')
const { generateUploadUrl, upload } = require('./lib')

function PacktrackerPlugin (options = {}) {
  this.report = options.report || process.env.PT_REPORT === 'true' || false

  if (this.report) {
    this.projectToken = options.project_token || process.env.PT_PROJECT_TOKEN

    this.host = options.host ||
      process.env.PT_HOST ||
      'https://api.packtracker.io'

    this.branch = options.branch ||
      process.env.PT_BRANCH ||
      runShell('git rev-parse --abbrev-ref HEAD')

    this.author = options.author ||
      process.env.PT_AUTHOR ||
      runShell('git log --format="%aE" -n 1 HEAD')

    this.message = options.message ||
      process.env.PT_MESSAGE ||
      runShell('git log --format="%B" -n 1 HEAD')

    this.commit = options.commit ||
      process.env.PT_COMMIT ||
      runShell('git rev-parse HEAD')

    this.committed_at = options.committed_at ||
      process.env.PT_COMMITTED_AT ||
      runShell('git log --format="%ct" -n 1 HEAD')

    this.priorCommit = options.prior_commit ||
      process.env.PT_PRIOR_COMMIT ||
      runShell('git rev-parse HEAD^')
  }
}

PacktrackerPlugin.prototype.apply = function (compiler) {
  if (!this.report) return

  compiler.plugin('emit', (currentCompiler, done) => {
    const stats = currentCompiler.getStats().toJson({ source: false })

    const payload = {
      packer: 'webpack@' + stats.version,
      commit: this.commit,
      committed_at: parseInt(this.committed_at),
      branch: this.branch,
      author: this.author,
      message: this.message,
      prior_commit: this.priorCommit,
      stats: stats
    }

    generateUploadUrl(this.host, this.projectToken, this.commit)
      .then(response => {
        payload.project_id = response.project_id
        return upload(response.upload_url, payload)
      })
      .then(() => {
        console.log('Packtracker stats uploaded!')
        done()
      })
      .catch((error) => {
        console.error(`Packtracker stats failed to upload: ${error.message}`)
        console.error(error)
        done()
      })
  })
}

function runShell (command) {
  return execSync(command).toString().trim()
}

module.exports = PacktrackerPlugin
