const express = require('express')
const router = express.Router()
const k8sHelpers = require('../service-library/helpers/k8s.helpers')
const { k8sConstants } = require('../service-library/constants')

router.delete('/name/:name', async (req, res, next) => {
  try {
    await k8sHelpers.deleteByName(k8sConstants.templateApi, req.params.name)

    res
      .status(200)
      .json({ message: `Template with name ${req.params.name} deleted` })
  } catch (error) {
    next(error)
  }
})

module.exports = router
