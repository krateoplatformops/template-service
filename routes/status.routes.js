const express = require('express')
const router = express.Router()

router.get('/healthz', (req, res) => {
  res.status(200).send('Template Service')
})

module.exports = router
