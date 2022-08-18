const express = require('express')
const cors = require('cors')({ origin: true, credentials: true })
const responseTime = require('response-time')

const app = express()
app.use(cors)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(responseTime({ suffix: false, digits: 0 }))

/* Middlewares */
const callLoggerMiddleware = require('./service-library/middlewares/call-logger.middleware')
const errorLoggerMiddleware = require('./service-library/middlewares/error-logger.middleware')

app.use(callLoggerMiddleware)

/* Routes */
const statusRoutes = require('./routes/status.routes')
const templateRoutes = require('./routes/template.routes')

app.use('/', statusRoutes)
app.use('/', templateRoutes)

app.use(errorLoggerMiddleware)

module.exports = app
