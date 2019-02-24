const { execSync } = require('child_process')
const { generateUploadUrl, uploadToS3 } = require('./lib')
const { getViewerData } = require('webpack-bundle-analyzer/lib/analyzer')
const { isPlainObject, isEmpty } = require('lodash')

function PacktrackerPlugin (options = {}) {
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

PacktrackerPlugin.prototype.apply = function (compiler) {
  if (!this.upload) return

  const upload = (stats) => {
    const directory = (compiler.outputFileSystem.constructor.name === 'MemoryFileSystem')
      ? null
      : compiler.outputPath

    const json = stats.toJson(this.statOptions)
    if (json.errors.length) return

    const payload = {
      packer: 'webpack@' + json.version,
      commit: this.commit,
      committed_at: parseInt(this.committedAt),
      branch: this.branch,
      author: this.author,
      message: this.message,
      prior_commit: this.priorCommit,
      stats: json,
      bundle: getBundleData(json, directory, this.excludeAssets)
    }

    const generate = generateUploadUrl(this.host, this.projectToken, this.commit)
      .then(response => {
        payload.project_id = response.project_id
        return uploadToS3(response.upload_url, payload)
      })
      .then(() => {
        console.log('Packtracker stats uploaded!')
      })

    return this.failBuild
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

function runShell (command) {
  return execSync(command).toString().trim()
}

function getBundleData (statJson, directory, excludeAssets = null) {
  let bundleData

  try {
    bundleData = getViewerData(statJson, directory, { excludeAssets })
  } catch (err) {
    console.error(`Could't analyze webpack bundle:\n${err}`)
    console.error(err.stack)
    bundleData = null
  }

  if (isPlainObject(bundleData) && isEmpty(bundleData)) {
    console.error("Could't find any javascript bundles")
    bundleData = null
  }

  return bundleData
}

module.exports = PacktrackerPlugin
