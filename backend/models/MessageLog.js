const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  template: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending', 'delivered', 'read'],
    default: 'pending'
  },
  retry_count: {
    type: Number,
    default: 0
  },
  max_retries: {
    type: Number,
    default: 3
  },
  error: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageLogSchema.index({ phone: 1, timestamp: -1 });
messageLogSchema.index({ status: 1, timestamp: -1 });
messageLogSchema.index({ contact: 1, timestamp: -1 });

module.exports = mongoose.model('MessageLog', messageLogSchema);