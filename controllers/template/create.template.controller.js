const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const timeHelpers = require('../../helpers/time.helpers')
const Template = mongoose.model('Template')

router.post('/', async (req, res, next) => {
  try {
    const doc = await Template.findOneAndUpdate(
      { url: req.body.url },
      { $set: { ...req.body, createdAt: timeHelpers.currentTime() } },
      {
        new: true,
        upsert: true
      }
    )
    res.status(200).json(doc)
  } catch (error) {
    next(error)
  }
})

module.exports = router
