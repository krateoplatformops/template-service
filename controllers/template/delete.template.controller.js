const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Template = mongoose.model('Template')

router.delete('/:id', async (req, res, next) => {
  try {
    Template.deleteOne({ _id: req.params.id })
      .then((doc) => {
        if (doc.deletedCount === 0) {
          res
            .status(404)
            .json({ message: `Template with id ${req.params.id} not found` })
        } else {
          res
            .status(200)
            .json({ message: `Template with id ${req.params.id} deleted` })
        }
      })
      .catch(() => {
        res.status(404).json({
          message: `Template with id ${req.params.id} not found and cannot be deleted`
        })
      })
  } catch (error) {
    next(error)
  }
})

module.exports = router
