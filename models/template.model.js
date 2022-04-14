const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { dbConstants } = require('../constants')

const templateSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  apiVersion: {
    type: String,
    required: true
  },
  metadata: {
    _id: false,
    required: true,
    type: {
      name: {
        type: String,
        required: true
      },
      annotations: {
        _id: false,
        required: true,
        type: {
          title: {
            type: String,
            required: true,
            trim: true
          },
          description: {
            type: String,
            required: true,
            trim: true
          },
          icon: {
            type: String,
            required: true
          },
          owner: {
            type: String,
            required: true,
            trim: true
          }
        }
      },
      labels: {
        _id: false,
        type: {
          tags: {
            type: [String],
            required: false
          }
        }
      }
    }
  },
  spec: {
    widgets: {
      required: true,
      type: [
        {
          title: {
            type: String,
            required: true,
            trim: true
          },
          properties: {
            type: Map,
            required: true
          }
        }
      ]
    }
  },
  createdAt: {
    type: Number,
    required: true
  }
})

templateSchema.index({ url: 1 }, { name: 'templateIndex' })

module.exports = mongoose.model(
  'Template',
  templateSchema,
  dbConstants.COLLECTION_TEMPLATE
)
