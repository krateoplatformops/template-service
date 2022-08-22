const express = require('express')
const router = express.Router()
const k8sHelpers = require('../service-library/helpers/k8s.helpers')
const { k8sConstants } = require('../service-library/constants')

router.get('/', async (req, res, next) => {
  try {
    const list = await k8sHelpers.getList(k8sConstants.templateApi)

    res.status(200).json({ list })
  } catch (error) {
    next(error)
  }
})

router.get('/name/:name', async (req, res, next) => {
  try {
    const t = await k8sHelpers.getSingleByName(
      k8sConstants.templateApi,
      req.params.name
    )

    res.status(200).json(t)
  } catch (error) {
    next(error)
  }
})

router.get('/uid/:uid', async (req, res, next) => {
  try {
    const t = await k8sHelpers.getSingleByUid(k8sConstants.templateApi, req.params.uid)

    res.status(200).json(t)
  } catch (error) {
    next(error)
  }
})

module.exports = router
