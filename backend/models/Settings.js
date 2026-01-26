const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  reminder_time: {
    type: String, // Format: HH:mm
    default: '18:00' // 6 PM default
  },
  reminder_timezone: {
    type: String,
    default: 'Asia/Kolkata' // Default timezone
  },
  admin_phone: {
    type: String,
    trim: true
  },
  admin_name: {
    type: String,
    trim: true
  },
  weekly_summary_day: {
    type: String,
    enum: ['sunday', 'monday', 'friday'],
    default: 'sunday'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

settingsSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

module.exports = mongoose.model('Settings', settingsSchema);