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
    }).then(response => response.body)
  },

  uploadToS3 (url, data) {
    return tiny.put({ url, data })
  }
}
