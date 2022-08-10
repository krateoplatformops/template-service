module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  GIT_URI: process.env.GIT_URI || '',
  ENDPOINT_URI: process.env.ENDPOINT_URI || '',
}
