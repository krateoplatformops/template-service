const express = require('express')
const router = express.Router()
const yaml = require('js-yaml')
const k8s = require('@kubernetes/client-node')
const k8sHelpers = require('../service-library/helpers/k8s.helpers')

const uriHelpers = require('../service-library/helpers/uri.helpers')
const gitHelpers = require('../service-library/helpers/git.helpers')
const logger = require('../service-library/helpers/logger.helpers')
const responseHelpers = require('../service-library/helpers/response.helpers')
const secretHelpers = require('../service-library/helpers/secret.helpers')

router.post('/', async (req, res, next) => {
  try {
    const { pathList } = uriHelpers.parse(req.body.url)

    const endpoint = await secretHelpers.getEndpoint(req.body.endpointName)
    logger.debug(endpoint)

    if (!endpoint) {
      return res.status(404).send({ message: 'Endpoint not found' })
    }

    let payload = {}
    switch (endpoint.metadata.type) {
      case 'github':
        payload = {
          ...req.body,
          org: pathList[0],
          repo: pathList[1],
          fileName: pathList[pathList.length - 1]
        }
        break
      case 'bitbucket':
        payload = {
          ...req.body,
          org: pathList[1],
          repo: pathList[3],
          fileName: pathList[pathList.length - 1]
        }
        break
      default:
        throw new Error(`Unsupported endpoint ${endpointName}`)
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
    payload.fileName = 'package.yaml'
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

    if (doc.statusCode && doc.statusCode !== 200) {
      return res.status(doc.statusCode).json({ message: doc.body.message })
    } else if (doc instanceof Error) {
      return res.status(500).json({ message: doc.message })
    }

    res.status(doc.statusCode || 200).json(responseHelpers.parse(doc))
  } catch (error) {
    next(error)
  }
})

module.exports = router
