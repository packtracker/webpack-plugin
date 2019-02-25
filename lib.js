const tiny = require('tiny-json-http')
const { isPlainObject, isEmpty } = require('lodash')
const { getViewerData } = require('webpack-bundle-analyzer/lib/analyzer')

module.exports = {
  generateUploadUrl (host, projectToken, commitHash) {
    return tiny.post({
      url: `${host}/generate-upload-url`,
      headers: { 'Accept': 'application/json' },
      data: {
        project_token: projectToken,
        commit_hash: commitHash
      }
    }).then(response => response.body)
  },

  uploadToS3 (url, data) {
    return tiny.put({ url, data })
  },

  getBundleData (statJson, directory, excludeAssets = null) {
    let data

    try {
      data = getViewerData(statJson, directory, { excludeAssets })
    } catch (err) {
      console.error(`Could't analyze webpack bundle:\n${err}`)
      console.error(err.stack)
      data = null
    }

    if (isPlainObject(data) && isEmpty(data)) {
      console.error("Could't find any javascript bundles")
      data = null
    }

    return data
  }
}
