class OptionsError extends Error {
  constructor () {
    super('packtracker: You can review the different ways you can set these options here: https://github.com/packtracker/webpack-plugin#options')
    this.name = 'OptionsError'
  }
}

module.exports = OptionsError
