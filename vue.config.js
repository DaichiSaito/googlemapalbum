const getOutputDir = () => {
  if (process.env.VUE_APP_MODE === "production") {
    return 'dist-production'
  } else if (process.env.VUE_APP_MODE === "staging") {
    return 'dist-staging'
  } else if (process.env.VUE_APP_MODE === "development") {
    return 'dist-development'
  }
}
module.exports = {
  outputDir: getOutputDir(),
}