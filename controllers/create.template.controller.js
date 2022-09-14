const express = require('express')
const router = express.Router()
const yaml = require('js-yaml')
const k8s = require('@kubernetes/client-node')
const k8sHelpers = require('../service-library/helpers/k8s.helpers')

const uriHelpers = require('../service-library/helpers/uri.helpers')
const gitHelpers = require('../service-library/helpers/git.helpers')
const logger = require('../service-library/helpers/logger.helpers')
const responseHelpers = require('../helpers/response.helpers')

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
      return res.status(404).send({ message: 'Template file not found' })
    }
    logger.debug(templateContent)
    const template = yaml.load(templateContent)
    template.spec.url = payload.url
    template.spec.endpointName = payload.endpointName
    template.spec.owner = res.locals.identity.username

    // get package
    payload.fileName = 'defaults/package.yaml'
    const packageContent = await gitHelpers.getFile(payload)
    if (!packageContent) {
      return res.status(404).send({ message: 'Package file not found' })
    }
    logger.debug(packageContent)
    const package = yaml.load(packageContent)

    const kc = new k8s.KubeConfig()
    kc.loadFromDefault()
    const client = k8s.KubernetesObjectApi.makeApiClient(kc)
    await k8sHelpers.create(client, package)
    const doc = await k8sHelpers.create(client, template)

    res.status(200).json(responseHelpers.parse(doc))
  } catch (error) {
    next(error)
  }
})

module.exports = router
