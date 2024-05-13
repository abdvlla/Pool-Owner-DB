const mongoose = require('mongoose')

const poolSchema = new mongoose.Schema({
  type: {
    type: String,
  },

  status: {
    type: String,
  },

  description: {
    type: String,
  },

  coverImage: {
    type: Buffer,
  },
  coverImageType: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
},
})

poolSchema.virtual('coverImagePath').get(function() {
  if (this.coverImage != null && this.coverImageType != null) {
    return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
  }
})

module.exports = mongoose.model('Pool', poolSchema)