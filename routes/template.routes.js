const express = require('express')
const router = express.Router()

const createController = require('../controllers/create.template.controller')
const readController = require('../controllers/read.template.controller')
const updateController = require('../controllers/update.template.controller')
const deleteController = require('../controllers/delete.template.controller')

router.use('/', createController)
router.use('/', readController)
router.use('/', updateController)
router.use('/', deleteController)

module.exports = router
