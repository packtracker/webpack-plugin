function PacktrackerPlugin (options) {
  this.project_token = options.project_token || process.env.PT_PROJECT_TOKEN
  this.commit_hash = options.commit_hash || process.env.PT_COMMIT_HASH
  this.packtracker_host = options.host || process.env.PT_HOST
}

PacktrackerPlugin.prototype.apply = function (compiler) {
  compiler.plugin('done', function () {
    console.log('Hello World!')
    console.log(arguments)
  })
}

module.exports = PacktrackerPlugin
