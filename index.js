const Config = require('./config')
const Upload = require('./upload')

function PacktrackerPlugin (options = {}) {
  this.config = new Config(options)
}

PacktrackerPlugin.prototype.apply = function (compiler) {
  if (!this.config.upload) return

  this.upload = new Upload(this.config)

  if (compiler.hooks) {
    compiler.hooks.done.tapPromise('packtracker', (stats) => {
      return this.upload.process(
        stats.toJson(this.config.statOptions),
        getOutputPath(compiler)
      )
    })
  } else {
    compiler.plugin('after-emit', (compilation, done) => {
      this.upload.process(
        compilation.getStats().toJson(this.config.statOptions),
        getOutputPath(compiler)
      ).then(done)
    })
  }
}

function getOutputPath (compiler) {
  return (compiler.outputFileSystem.constructor.name === 'MemoryFileSystem')
    ? null
    : compiler.outputPath
}

module.exports = PacktrackerPlugin
