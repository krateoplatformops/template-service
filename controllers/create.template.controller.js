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

router.post('/', async (req, res, next) => {
  try {
    // get endpoint settings
    const endpointUrl = uriHelpers.concatUrl([
      envConstants.ENDPOINT_URI,
      'name',
      req.body.endpointName
    ])
    const endpoint = (await axios.get(endpointUrl)).data
    const endpointData = stringHelpers.to64(
      JSON.stringify({
        target: endpoint.target,
        secret: endpoint.secret,
        type: endpoint.type
      })
    )

    // get template yaml
    const template = await axios.get(
      uriHelpers.concatUrl([
        envConstants.GIT_URI,
        'file',
        stringHelpers.to64(req.body.url),
        endpointData,
        stringHelpers.to64('template.yaml')
      ])
    )
    const y = yaml.load(template.data.content)

    // get package
    const package = await axios.get(
      uriHelpers.concatUrl([
        envConstants.GIT_URI,
        'file',
        stringHelpers.to64(req.body.url),
        endpointData,
        stringHelpers.to64('defaults/package.yaml')
      ])
    )
    const pkjJson = yaml.load(package.data.content)
    const kc = new k8s.KubeConfig()
    kc.loadFromDefault()
    const client = k8s.KubernetesObjectApi.makeApiClient(kc)
    await k8sHelpers.create(client, pkjJson)

    const doc = await Template.findOneAndUpdate(
      { url: req.body.url },
      {
        $set: {
          ...y,
          url: req.body.url,
          endpointName: req.body.endpointName,
          createdAt: timeHelpers.currentTime(),
          package: pkjJson
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
