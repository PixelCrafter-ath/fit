const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_phone: {
    type: String,
    required: true,
    trim: true
  },
  message_text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  message_date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying by date and sender
messageSchema.index({ message_date: 1, sender_phone: 1 });
messageSchema.index({ sender_phone: 1, message_date: 1 });

module.exports = mongoose.model('Message', messageSchema);