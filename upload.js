const tiny = require('tiny-json-http')
const { getViewerData } = require('webpack-bundle-analyzer/lib/analyzer')
const { isPlainObject, isEmpty, cloneDeep } = require('lodash')
const omitDeep = require('omit-deep')
const logger = require('./logger')

class Upload {
  constructor (config) {
    this.config = config
  }

  process (statsJson, outputPath) {
    logger('processing upload')
    if (statsJson.errors.length) {
      logger('halting upload due to stats errors')
      statsJson.errors.forEach((e) => logger(`stats error: ${e}`))
      return Promise.resolve()
    }

    // Ensure we're not capturing the source
    statsJson = omitDeep(statsJson, ['source'])
    logger('filtering out source from stats json')

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
        logger(`upload url generated (${response.upload_url})`)
        payload.project_id = response.project_id
        return uploadToS3(response.upload_url, payload)
      })
      .then(() => {
        logger('stats uploaded')
      })
      .catch((error) => {
        logger(`stats failed to upload: ${error.message}`)
        logger(`this could be because your project token is not properly set`)

        if (this.config.failBuild) {
          logger('re-throwing failure because `fail_build` set to true')
          throw error
        }
      })
  }
}

function getBundleData (statJson, outputPath, excludeAssets = null) {
  let data

  logger('retrieving javascript bundle data')

  try {
    data = getViewerData(statJson, outputPath, { excludeAssets })
  } catch (err) {
    logger(`could not analyze webpack bundle (${err})`)
    data = null
  }

  if (isPlainObject(data) && isEmpty(data)) {
    logger('could not find any javascript bundles')
    data = null
  }

  return data
}

function generateUploadUrl (host, projectToken, commitHash) {
  logger('generating upload url')
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
  logger('uploading to s3')
  return tiny.put({ url, data })
}

module.exports = Upload
