const express = require('express');
const router = express.Router();
const streakLogic = require('../utils/streakLogic');
const Contact = require('../models/Contact');
const Message = require('../models/Message');

/**
 * @route   GET /api/diet-status
 * @desc    Get diet status for all contacts for a specific date
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    
    const result = await streakLogic.getDietStatusForDate(date);
    
    res.json(result);
  } catch (error) {
    console.error('Error getting diet status:', error);
    res.status(500).json({ 
      error: 'Failed to get diet status',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/diet-status/history/:contactId
 * @desc    Get diet history for a specific contact
 * @access  Public
 */
router.get('/history/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { start_date, end_date } = req.query;
    
    // Default to last 30 days if dates not provided
    const endDate = end_date || new Date().toISOString().split('T')[0];
    const startDate = start_date || new Date(new Date(endDate).setDate(new Date(endDate).getDate() - 30)).toISOString().split('T')[0];

    const result = await streakLogic.getDietHistory(contactId, startDate, endDate);
    
    res.json(result);
  } catch (error) {
    console.error('Error getting diet history:', error);
    res.status(500).json({ 
      error: 'Failed to get diet history',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/diet-status/today
 * @desc    Get today's diet status (shortcut for current date)
 * @access  Public
 */
router.get('/today', async (req, res) => {
  try {
    const result = await streakLogic.getDietStatusForDate();
    
    res.json(result);
  } catch (error) {
    console.error('Error getting today\'s diet status:', error);
    res.status(500).json({ 
      error: 'Failed to get today\'s diet status',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/diet-status/stats
 * @desc    Get overall statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const contacts = await Contact.find({ active: true });
    const totalContacts = contacts.length;
    
    // Get today's status
    const todayStatus = await streakLogic.getDietStatusForDate();
    
    // Get this week's data
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    const weeklyStats = await streakLogic.getWeeklySummaryData(weekStartStr);
    
    // Calculate overall stats
    const totalMessages = await Message.countDocuments();
    const avgStreak = contacts.reduce((sum, contact) => sum + contact.current_streak, 0) / totalContacts;
    
    const stats = {
      total_contacts: totalContacts,
      active_contacts: contacts.filter(c => c.active).length,
      contacts_with_reminders: contacts.filter(c => c.reminder_enabled).length,
      today_status: {
        updated: todayStatus.updated_count,
        missed: todayStatus.missed_count,
        update_rate: totalContacts > 0 ? (todayStatus.updated_count / totalContacts * 100).toFixed(1) : 0
      },
      weekly_summary: {
        week_start: weeklyStats.week_start,
        week_end: weeklyStats.week_end,
        total_updates: weeklyStats.summary.total_updates,
        avg_updates_per_contact: weeklyStats.summary.avg_updates_per_contact.toFixed(1),
        completion_rate: weeklyStats.summary.completion_rate.toFixed(1)
      },
      overall_stats: {
        total_messages: totalMessages,
        average_streak: isNaN(avgStreak) ? 0 : avgStreak.toFixed(1),
        longest_streak: Math.max(...contacts.map(c => c.longest_streak), 0),
        contacts_with_active_streaks: contacts.filter(c => c.current_streak > 0).length
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/diet-status/heatmap
 * @desc    Get data for heatmap visualization
 * @access  Public
 */
router.get('/heatmap', async (req, res) => {
  try {
    const { contactId, months } = req.query;
    const monthsBack = parseInt(months) || 3;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    let query = {
      message_date: {
        $gte: startStr,
        $lte: endStr
      }
    };
    
    if (contactId) {
      query.contact = contactId;
    }
    
    const messages = await Message.find(query)
      .populate('contact', 'name phone_number')
      .sort({ message_date: 1 });
    
    // Group by date and contact
    const heatmapData = {};
    
    messages.forEach(msg => {
      const date = msg.message_date;
      const contactId = msg.contact?._id.toString() || 'unknown';
      const contactName = msg.contact?.name || 'Unknown';
      
      if (!heatmapData[date]) {
        heatmapData[date] = {};
      }
      
      if (!heatmapData[date][contactId]) {
        heatmapData[date][contactId] = {
          name: contactName,
          count: 0
        };
      }
      
      heatmapData[date][contactId].count += 1;
    });
    
    // Convert to array format for easier frontend consumption
    const result = Object.entries(heatmapData).map(([date, contacts]) => ({
      date,
      contacts: Object.entries(contacts).map(([contactId, data]) => ({
        contact_id: contactId,
        name: data.name,
        updates: data.count
      })),
      total_updates: Object.values(contacts).reduce((sum, c) => sum + c.count, 0)
    }));
    
    res.json({
      data: result,
      period: {
        start: startStr,
        end: endStr,
        months: monthsBack
      }
    });
  } catch (error) {
    console.error('Error getting heatmap data:', error);
    res.status(500).json({ 
      error: 'Failed to get heatmap data',
      details: error.message 
    });
  }
});

module.exports = router;