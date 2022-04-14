const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Template = mongoose.model('Template')

router.get('/', async (req, res, next) => {
  try {
    Template.find()
      .then((template) => {
        res.status(200).json(template)
      })
      .catch((err) => {
        next(err)
      })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    Template.findById(req.params.id)
      .exec()
      .then((template) => {
        res.status(200).json(template)
      })
      .catch((err) => {
        res.status(404).json({
          message: `Template with id ${req.params.id} not found`
        })
      })
  } catch (error) {
    next(error)
  }
})

module.exports = router
