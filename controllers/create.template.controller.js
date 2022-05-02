const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const axios = require('axios')
const yaml = require('js-yaml')

const { envConstants } = require('../constants')
const timeHelpers = require('../helpers/time.helpers')
const stringHelpers = require('../helpers/string.helpers')
const uriHelpers = require('../helpers/uri.helpers')
const Template = mongoose.model('Template')

router.post('/', async (req, res, next) => {
  try {
    const template = await axios.get(
      uriHelpers.concatUrl([
        envConstants.GIT_URI,
        'file',
        stringHelpers.to64(req.body.url),
        stringHelpers.to64('template.yaml')
      ])
    )
    const y = await yaml.load(template.data.content)

    const doc = await Template.findOneAndUpdate(
      { url: req.body.url },
      {
        $set: {
          ...y,
          createdAt: timeHelpers.currentTime()
        }
      },
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
