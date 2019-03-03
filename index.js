const Config = require('./config')
const { getBundleData, generateUploadUrl, uploadToS3 } = require('./lib')

function PacktrackerPlugin (options = {}) {
  this.config = new Config(options)
}

PacktrackerPlugin.prototype.apply = function (compiler) {
  if (!this.config.upload) return

  const upload = (stats) => {
    const directory = (compiler.outputFileSystem.constructor.name === 'MemoryFileSystem')
      ? null
      : compiler.outputPath

    const json = stats.toJson(this.config.statOptions)
    if (json.errors.length) return

    const payload = {
      packer: 'webpack@' + json.version,
      commit: this.config.commit,
      committed_at: parseInt(this.config.committedAt),
      branch: this.config.branch,
      author: this.config.author,
      message: this.config.message,
      prior_commit: this.config.priorCommit,
      stats: json,
      bundle: getBundleData(
        stats.toJson(this.config.statOptions),
        directory,
        this.config.excludeAssets
      )
    }

    const generate = generateUploadUrl(
      this.config.host,
      this.config.projectToken,
      this.config.commit
    )
      .then(response => {
        payload.project_id = response.project_id
        return uploadToS3(response.upload_url, payload)
      })
      .then(() => {
        console.log('Packtracker stats uploaded!')
      })

    return this.config.failBuild
      ? generate
      : generate.catch((error) => {
        console.error(`Packtracker stats failed to upload: ${error.message}`)
        console.error(error)
      })
  }

  if (compiler.hooks) {
    compiler.hooks.done.tapPromise('packtracker', upload)
  } else {
    compiler.plugin('after-emit', (compilation, done) => {
      upload(compilation.getStats()).then(done)
    })
  }
}

module.exports = PacktrackerPlugin
