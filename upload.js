const tiny = require('tiny-json-http')
const { getViewerData } = require('webpack-bundle-analyzer/lib/analyzer')
const { isPlainObject, isEmpty, cloneDeep } = require('lodash')
const omitDeep = require('omit-deep')

class Upload {
  constructor (config) {
    this.config = config
  }

  process (statsJson, outputPath) {
    if (statsJson.errors.length) return

    // Ensure we're not capturing the source
    statsJson = omitDeep(statsJson, ['source'])

    const payload = {
      packer: 'webpack@' + statsJson.version,
      commit: this.config.commit,
      committed_at: parseInt(this.config.committedAt),
      branch: this.config.branch,
      author: this.config.author,
      message: this.config.message,
      prior_commit: this.config.priorCommit,
      stats: statsJson,
      bundle: getBundleData(
        cloneDeep(statsJson),
        outputPath,
        this.config.excludeAssets
      )
    }

    return generateUploadUrl(
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
      .catch((error) => {
        console.error(`Packtracker stats failed to upload: ${error.message}`)
        console.error(error)

        if (this.config.failBuild) {
          throw error
        }
      })
  }
}

function getBundleData (statJson, outputPath, excludeAssets = null) {
  let data

  try {
    data = getViewerData(statJson, outputPath, { excludeAssets })
  } catch (err) {
    console.error(`Could not analyze webpack bundle:\n${err}`)
    console.error(err.stack)
    data = null
  }

  if (isPlainObject(data) && isEmpty(data)) {
    console.error('Could not find any javascript bundles')
    data = null
  }

  return data
}

function generateUploadUrl (host, projectToken, commitHash) {
  return tiny.post({
    url: `${host}/generate-upload-url`,
    headers: { 'Accept': 'application/json' },
    data: {
      project_token: projectToken,
      commit_hash: commitHash
    }
  }).then(response => response.body)
}

function uploadToS3 (url, data) {
  return tiny.put({ url, data })
}

module.exports = Upload
