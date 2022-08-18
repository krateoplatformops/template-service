const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const axios = require('axios')
const yaml = require('js-yaml')
const k8s = require('@kubernetes/client-node')
const k8sHelpers = require('../helpers/k8s.helpers')

const { envConstants } = require('../constants')
const timeHelpers = require('../helpers/time.helpers')
const stringHelpers = require('../helpers/string.helpers')
const uriHelpers = require('../helpers/uri.helpers')
const Template = mongoose.model('Template')
const gitHelpers = require('../helpers/git.helpers')
const { logger } = require('../helpers/logger.helpers')

router.post('/', async (req, res, next) => {
  try {
    const { pathList } = uriHelpers.parse(req.body.url)

    const payload = {
      ...req.body,
      org: pathList[0],
      repo: pathList[1],
      fileName: pathList[pathList.length - 1]
    }

    // get template
    const templateContent = await gitHelpers.getFile(payload)
    if (!templateContent) {
      return res.status(404).send({ message: 'File not found' })
    }
    logger.debug(templateContent)
    const template = yaml.load(templateContent)

    // get package
    payload.fileName = 'defaults/package.yaml'
    const packageContent = await gitHelpers.getFile(payload)
    if (!packageContent) {
      return res.status(404).send({ message: 'File not found' })
    }
    logger.debug(packageContent)
    const package = yaml.load(packageContent)

    const kc = new k8s.KubeConfig()
    kc.loadFromDefault()
    const client = k8s.KubernetesObjectApi.makeApiClient(kc)
    await k8sHelpers.create(client, package)

    const doc = await Template.findOneAndUpdate(
      { url: req.body.url },
      {
        $set: {
          ...template,
          url: req.body.url,
          endpointName: req.body.endpointName,
          createdAt: timeHelpers.currentTime(),
          package,
          organizationName: pathList[0],
          repositoryName: pathList[1]
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
