const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Message = require('../models/Message');
const WeeklySummary = require('../models/WeeklySummary');
const MessageLog = require('../models/MessageLog');
const moment = require('moment-timezone');
const json2csv = require('json2csv').Parser;

/**
 * @route   GET /api/exports/csv/contacts
 * @desc    Export contacts as CSV
 * @access  Public
 */
router.get('/csv/contacts', async (req, res) => {
  try {
    const { active, reminder_enabled } = req.query;
    
    // Build filter
    const filter = {};
    if (active !== undefined) filter.active = active === 'true';
    if (reminder_enabled !== undefined) filter.reminder_enabled = reminder_enabled === 'true';
    
    const contacts = await Contact.find(filter);
    
    // Transform data for CSV
    const csvData = contacts.map(contact => ({
      'Name': contact.name,
      'Phone Number': contact.phone_number,
      'Active': contact.active ? 'Yes' : 'No',
      'Reminder Enabled': contact.reminder_enabled ? 'Yes' : 'No',
      'Language': contact.language,
      'User Type': contact.user_type,
      'Current Streak': contact.current_streak,
      'Longest Streak': contact.longest_streak,
      'Last Reminder Date': contact.last_reminder_date ? 
        moment(contact.last_reminder_date).format('YYYY-MM-DD HH:mm:ss') : 'Never',
      'Created At': moment(contact.created_at).format('YYYY-MM-DD HH:mm:ss'),
      'Updated At': moment(contact.updated_at).format('YYYY-MM-DD HH:mm:ss')
    }));
    
    // Generate CSV
    const csvFields = [
      'Name', 'Phone Number', 'Active', 'Reminder Enabled', 'Language', 
      'User Type', 'Current Streak', 'Longest Streak', 'Last Reminder Date', 
      'Created At', 'Updated At'
    ];
    
    const json2csvParser = new json2csv({ fields: csvFields });
    const csv = json2csvParser.parse(csvData);
    
    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment('contacts.csv');
    return res.send(csv);
    
  } catch (error) {
    console.error('Error exporting contacts CSV:', error);
    res.status(500).json({ 
      error: 'Failed to export contacts CSV',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/exports/csv/messages
 * @desc    Export messages as CSV
 * @access  Public
 */
router.get('/csv/messages', async (req, res) => {
  try {
    const { start_date, end_date, contact_id } = req.query;
    
    // Build filter
    const filter = {};
    
    if (start_date || end_date) {
      filter.message_date = {};
      if (start_date) filter.message_date.$gte = start_date;
      if (end_date) filter.message_date.$lte = end_date;
    }
    
    if (contact_id) {
      filter.contact = contact_id;
    }
    
    const messages = await Message.find(filter)
      .populate('contact', 'name phone_number')
      .sort({ timestamp: -1 });
    
    // Transform data for CSV
    const csvData = messages.map(message => ({
      'Date': message.message_date,
      'Timestamp': moment(message.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      'Sender Name': message.contact?.name || 'Unknown',
      'Phone Number': message.sender_phone,
      'Message': message.message_text.length > 100 ? 
        message.message_text.substring(0, 100) + '...' : message.message_text
    }));
    
    // Generate CSV
    const csvFields = ['Date', 'Timestamp', 'Sender Name', 'Phone Number', 'Message'];
    const json2csvParser = new json2csv({ fields: csvFields });
    const csv = json2csvParser.parse(csvData);
    
    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment('messages.csv');
    return res.send(csv);
    
  } catch (error) {
    console.error('Error exporting messages CSV:', error);
    res.status(500).json({ 
      error: 'Failed to export messages CSV',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/exports/csv/weekly-summaries
 * @desc    Export weekly summaries as CSV
 * @access  Public
 */
router.get('/csv/weekly-summaries', async (req, res) => {
  try {
    const { start_date, end_date, contact_id } = req.query;
    
    // Build filter
    const filter = {};
    
    if (start_date) filter.week_start_date = { $gte: start_date };
    if (end_date) filter.week_end_date = { $lte: end_date };
    if (contact_id) filter.contact = contact_id;
    
    const summaries = await WeeklySummary.find(filter)
      .populate('contact', 'name phone_number')
      .sort({ week_start_date: -1 });
    
    // Transform data for CSV
    const csvData = summaries.map(summary => ({
      'Week Start': summary.week_start_date,
      'Week End': summary.week_end_date,
      'Contact Name': summary.contact?.name || 'Unknown',
      'Phone Number': summary.contact?.phone_number || 'Unknown',
      'Total Expected Days': summary.total_expected_days,
      'Days Updated': summary.days_updated,
      'Days Missed': summary.days_missed,
      'Completion Rate (%)': ((summary.days_updated / summary.total_expected_days) * 100).toFixed(1),
      'Average Streak': summary.average_streak,
      'Generated At': moment(summary.generated_at).format('YYYY-MM-DD HH:mm:ss')
    }));
    
    // Generate CSV
    const csvFields = [
      'Week Start', 'Week End', 'Contact Name', 'Phone Number', 
      'Total Expected Days', 'Days Updated', 'Days Missed', 
      'Completion Rate (%)', 'Average Streak', 'Generated At'
    ];
    
    const json2csvParser = new json2csv({ fields: csvFields });
    const csv = json2csvParser.parse(csvData);
    
    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment('weekly_summaries.csv');
    return res.send(csv);
    
  } catch (error) {
    console.error('Error exporting weekly summaries CSV:', error);
    res.status(500).json({ 
      error: 'Failed to export weekly summaries CSV',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/exports/csv/message-logs
 * @desc    Export message logs as CSV
 * @access  Public
 */
router.get('/csv/message-logs', async (req, res) => {
  try {
    const { start_date, end_date, status } = req.query;
    
    // Build filter
    const filter = {};
    
    if (start_date || end_date) {
      filter.timestamp = {};
      if (start_date) filter.timestamp.$gte = new Date(start_date);
      if (end_date) filter.timestamp.$lte = new Date(end_date);
    }
    
    if (status) {
      filter.status = status;
    }
    
    const logs = await MessageLog.find(filter)
      .populate('contact', 'name')
      .sort({ timestamp: -1 });
    
    // Transform data for CSV
    const csvData = logs.map(log => ({
      'Date': moment(log.timestamp).format('YYYY-MM-DD'),
      'Time': moment(log.timestamp).format('HH:mm:ss'),
      'Phone Number': log.phone,
      'Contact Name': log.contact?.name || 'Unknown',
      'Template': log.template,
      'Status': log.status,
      'Retry Count': log.retry_count,
      'Max Retries': log.max_retries,
      'Error': log.error || ''
    }));
    
    // Generate CSV
    const csvFields = [
      'Date', 'Time', 'Phone Number', 'Contact Name', 'Template', 
      'Status', 'Retry Count', 'Max Retries', 'Error'
    ];
    
    const json2csvParser = new json2csv({ fields: csvFields });
    const csv = json2csvParser.parse(csvData);
    
    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment('message_logs.csv');
    return res.send(csv);
    
  } catch (error) {
    console.error('Error exporting message logs CSV:', error);
    res.status(500).json({ 
      error: 'Failed to export message logs CSV',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/exports/json/contacts
 * @desc    Export contacts as JSON
 * @access  Public
 */
router.get('/json/contacts', async (req, res) => {
  try {
    const { active, reminder_enabled } = req.query;
    
    const filter = {};
    if (active !== undefined) filter.active = active === 'true';
    if (reminder_enabled !== undefined) filter.reminder_enabled = reminder_enabled === 'true';
    
    const contacts = await Contact.find(filter);
    
    res.header('Content-Type', 'application/json');
    res.attachment('contacts.json');
    return res.json(contacts);
    
  } catch (error) {
    console.error('Error exporting contacts JSON:', error);
    res.status(500).json({ 
      error: 'Failed to export contacts JSON',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/exports/json/messages
 * @desc    Export messages as JSON
 * @access  Public
 */
router.get('/json/messages', async (req, res) => {
  try {
    const { start_date, end_date, contact_id } = req.query;
    
    const filter = {};
    
    if (start_date || end_date) {
      filter.message_date = {};
      if (start_date) filter.message_date.$gte = start_date;
      if (end_date) filter.message_date.$lte = end_date;
    }
    
    if (contact_id) {
      filter.contact = contact_id;
    }
    
    const messages = await Message.find(filter)
      .populate('contact', 'name phone_number')
      .sort({ timestamp: -1 });
    
    res.header('Content-Type', 'application/json');
    res.attachment('messages.json');
    return res.json(messages);
    
  } catch (error) {
    console.error('Error exporting messages JSON:', error);
    res.status(500).json({ 
      error: 'Failed to export messages JSON',
      details: error.message 
    });
  }
});

module.exports = router;