const express = require('express');
const router = express.Router();
const WeeklySummary = require('../models/WeeklySummary');
const Contact = require('../models/Contact');
const streakLogic = require('../utils/streakLogic');
const moment = require('moment-timezone');

/**
 * @route   GET /api/weekly-summary
 * @desc    Get weekly summaries with optional filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { contact_id, start_date, end_date, limit } = req.query;
    
    let query = {};
    
    if (contact_id) {
      query.contact = contact_id;
    }
    
    if (start_date) {
      query.week_start_date = { $gte: start_date };
    }
    
    if (end_date) {
      query.week_end_date = { $lte: end_date };
    }
    
    const limitNum = limit ? parseInt(limit) : 50;
    
    const summaries = await WeeklySummary.find(query)
      .populate('contact', 'name phone_number user_type current_streak')
      .sort({ week_start_date: -1, generated_at: -1 })
      .limit(limitNum);
    
    res.json({
      summaries,
      count: summaries.length
    });
  } catch (error) {
    console.error('Error fetching weekly summaries:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weekly summaries',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/weekly-summary/current
 * @desc    Get current week's summary for all contacts
 * @access  Public
 */
router.get('/current', async (req, res) => {
  try {
    const today = moment().tz('Asia/Kolkata');
    const weekStart = today.clone().startOf('week').format('YYYY-MM-DD');
    
    const result = await streakLogic.getWeeklySummaryData(weekStart);
    
    res.json(result);
  } catch (error) {
    console.error('Error getting current week summary:', error);
    res.status(500).json({ 
      error: 'Failed to get current week summary',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/weekly-summary/:contactId
 * @desc    Get weekly summaries for a specific contact
 * @access  Public
 */
router.get('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { limit } = req.query;
    
    const limitNum = limit ? parseInt(limit) : 10;
    
    const summaries = await WeeklySummary.find({ contact: contactId })
      .sort({ week_start_date: -1 })
      .limit(limitNum);
    
    const contact = await Contact.findById(contactId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({
      contact: {
        _id: contact._id,
        name: contact.name,
        phone_number: contact.phone_number
      },
      summaries,
      count: summaries.length
    });
  } catch (error) {
    console.error('Error fetching contact summaries:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contact summaries',
      details: error.message 
    });
  }
});

/**
 * @route   POST /api/weekly-summary/generate
 * @desc    Manually generate weekly summaries for a specific week
 * @access  Public
 */
router.post('/generate', async (req, res) => {
  try {
    const { week_start_date } = req.body;
    
    if (!week_start_date) {
      return res.status(400).json({ 
        error: 'Week start date is required (YYYY-MM-DD format)' 
      });
    }

    // Validate date format
    if (!moment(week_start_date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Check if summaries already exist for this week
    const existingSummaries = await WeeklySummary.countDocuments({
      week_start_date: week_start_date
    });

    if (existingSummaries > 0) {
      return res.status(400).json({ 
        error: 'Summaries already exist for this week',
        existing_count: existingSummaries
      });
    }

    // Generate summaries for the specified week
    const result = await streakLogic.getWeeklySummaryData(week_start_date);
    
    res.json({
      message: 'Weekly summaries generated successfully',
      week_start: result.week_start,
      week_end: result.week_end,
      summary_count: result.data.length
    });
  } catch (error) {
    console.error('Error generating weekly summaries:', error);
    res.status(500).json({ 
      error: 'Failed to generate weekly summaries',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/weekly-summary/stats
 * @desc    Get aggregated statistics from weekly summaries
 * @access  Public
 */
router.get('/stats/aggregated', async (req, res) => {
  try {
    const { weeks_back } = req.query;
    const weeksBack = parseInt(weeks_back) || 4; // Default to last 4 weeks
    
    const cutoffDate = moment().tz('Asia/Kolkata')
      .subtract(weeksBack, 'weeks')
      .startOf('week')
      .format('YYYY-MM-DD');
    
    const summaries = await WeeklySummary.find({
      week_start_date: { $gte: cutoffDate }
    }).populate('contact', 'name user_type');
    
    // Aggregate statistics
    const contactStats = {};
    const weeklyTotals = {};
    
    summaries.forEach(summary => {
      const contactId = summary.contact._id.toString();
      const week = summary.week_start_date;
      
      // Per-contact statistics
      if (!contactStats[contactId]) {
        contactStats[contactId] = {
          contact: summary.contact,
          total_weeks: 0,
          total_updates: 0,
          total_missed: 0,
          avg_completion_rate: 0
        };
      }
      
      contactStats[contactId].total_weeks += 1;
      contactStats[contactId].total_updates += summary.days_updated;
      contactStats[contactId].total_missed += summary.days_missed;
      contactStats[contactId].avg_completion_rate += (summary.days_updated / summary.total_expected_days) * 100;
      
      // Weekly totals
      if (!weeklyTotals[week]) {
        weeklyTotals[week] = {
          week_start: week,
          total_contacts: 0,
          total_updates: 0,
          total_missed: 0,
          completion_rates: []
        };
      }
      
      weeklyTotals[week].total_contacts += 1;
      weeklyTotals[week].total_updates += summary.days_updated;
      weeklyTotals[week].total_missed += summary.days_missed;
      weeklyTotals[week].completion_rates.push((summary.days_updated / summary.total_expected_days) * 100);
    });
    
    // Calculate averages
    Object.values(contactStats).forEach(stat => {
      stat.avg_completion_rate = stat.avg_completion_rate / stat.total_weeks;
    });
    
    Object.values(weeklyTotals).forEach(weekStat => {
      weekStat.avg_completion_rate = weekStat.completion_rates.reduce((a, b) => a + b, 0) / weekStat.completion_rates.length;
      delete weekStat.completion_rates; // Clean up
    });
    
    res.json({
      period: {
        weeks_back: weeksBack,
        start_date: cutoffDate,
        end_date: moment().tz('Asia/Kolkata').format('YYYY-MM-DD')
      },
      contact_statistics: Object.values(contactStats),
      weekly_trends: Object.values(weeklyTotals).sort((a, b) => a.week_start.localeCompare(b.week_start)),
      overall_stats: {
        total_participants: Object.keys(contactStats).length,
        avg_weekly_completion_rate: Object.values(weeklyTotals).reduce((sum, week) => sum + week.avg_completion_rate, 0) / Object.values(weeklyTotals).length
      }
    });
  } catch (error) {
    console.error('Error getting aggregated statistics:', error);
    res.status(500).json({ 
      error: 'Failed to get aggregated statistics',
      details: error.message 
    });
  }
});

module.exports = router;