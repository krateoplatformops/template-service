const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Template = mongoose.model('Template')
const k8s = require('@kubernetes/client-node')
const k8sHelpers = require('../helpers/k8s.helpers')

router.delete('/:id', async (req, res, next) => {
  try {
    Template.findById(req.params.id)
      .then(async (doc) => {
        try {
          if (doc.deletedCount === 0) {
            res
              .status(404)
              .json({ message: `Template with id ${req.params.id} not found` })
          } else {
            const kc = new k8s.KubeConfig()
            kc.loadFromDefault()
            const client = k8s.KubernetesObjectApi.makeApiClient(kc)
            await k8sHelpers.remove(client, doc.package)

            await Template.findByIdAndDelete(req.params.id)
            res
              .status(200)
              .json({ message: `Template with id ${req.params.id} deleted` })
          }
        } catch (ee) {
          res.status(500).json({ message: ee.message })
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
