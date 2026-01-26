const mongoose = require('mongoose');

const weeklySummarySchema = new mongoose.Schema({
  week_start_date: {
    type: String, // Format: YYYY-MM-DD (Monday of the week)
    required: true
  },
  week_end_date: {
    type: String, // Format: YYYY-MM-DD (Sunday of the week)
    required: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
    index: true
  },
  total_expected_days: {
    type: Number,
    default: 7
  },
  days_updated: {
    type: Number,
    default: 0
  },
  days_missed: {
    type: Number,
    default: 0
  },
  average_streak: {
    type: Number,
    default: 0
  },
  summary_data: {
    type: Object // Additional summary data in JSON format
  },
  generated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
weeklySummarySchema.index({ week_start_date: 1, contact: 1 }, { unique: true });
weeklySummarySchema.index({ contact: 1, week_start_date: -1 });

module.exports = mongoose.model('WeeklySummary', weeklySummarySchema);