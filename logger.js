module.exports = function (message) {
  if (process.env.PT_DEBUG) {
    console.log(`packtracker: ${message}`)
  }
}
