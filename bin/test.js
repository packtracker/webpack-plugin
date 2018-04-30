const crypto = require('crypto')
const sha = crypto.createHmac('sha1', Math.random().toString())
  .update(Math.random().toString())
  .digest('hex')

const {
  generateUploadUrl,
  clean,
  upload
} = require('../lib')

const HOST = 'http://localhost:3001'
const PROJECT_TOKEN = 'emptyprojecttoken'

const statsObject = {
  hello: 'world'
}

generateUploadUrl(HOST, PROJECT_TOKEN, sha)
  .then(url => upload(url, clean(statsObject)))
  .then(console.log)
  .catch(console.error)
