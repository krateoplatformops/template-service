const express = require('express')
const router = express.Router()

const createController = require('../controllers/template/create.template.controller')
const readController = require('../controllers/template/read.template.controller')
const updateController = require('../controllers/template/update.template.controller')
const deleteController = require('../controllers/template/delete.template.controller')

router.use('/', createController)
router.use('/', readController)
router.use('/', updateController)
router.use('/', deleteController)

module.exports = router
