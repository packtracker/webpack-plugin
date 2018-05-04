const { generateUploadUrl, upload } = require('./lib')

function PacktrackerPlugin (options) {
  this.project_token = options.project_token || process.env.PT_PROJECT_TOKEN
  this.branch = options.branch || process.env.PT_BRANCH
  this.commit = options.commit || process.env.PT_COMMIT
  this.priorCommit = options.prior_commit || process.env.PT_PRIOR_COMMIT
  this.host = options.host || process.env.PT_HOST
}

PacktrackerPlugin.prototype.apply = function (compiler) {
  compiler.plugin('emit', (currentCompiler, done) => {
    const stats = currentCompiler.getStats().toJson({ source: false })

    const payload = {
      packer: 'webpack@' + stats.version,
      commit: this.commit,
      branch: this.branch,
      prior_commit: this.priorCommit,
      stats: stats
    }

    generateUploadUrl(this.host, this.project_token, this.commit)
      .then(response => {
        payload.project_id = response.project_id
        return upload(response.upload_url, payload)
      })
      .then(() => done())
      .catch(done)
  })
}

module.exports = PacktrackerPlugin
