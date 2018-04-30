const tiny = require('tiny-json-http')

module.exports = {
  generateUploadUrl (host, projectToken, commitHash) {
    return tiny.post({
      url: `${host}/generate-upload-url`,
      headers: { 'Accept': 'application/json' },
      data: {
        project_token: projectToken,
        commit_hash: commitHash
      }
    }).then(response => response.body.upload_url)
  },

  clean (stats) {
    // TODO: remove all source from stats objects
    return stats
  },

  upload (url, data) {
    return tiny.put({
      url,
      data,
      headers: {
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    })
  }
}
