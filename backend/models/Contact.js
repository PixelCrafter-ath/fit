const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  reminder_enabled: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  user_type: {
    type: String,
    enum: ['general', 'weight_loss', 'diabetic'],
    default: 'general'
  },
  last_reminder_date: {
    type: Date,
    default: null
  },
  current_streak: {
    type: Number,
    default: 0
  },
  longest_streak: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

contactSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Contact', contactSchema);