const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

/**
 * @route   GET /api/settings
 * @desc    Get current settings
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch settings',
      details: error.message 
    });
  }
});

/**
 * @route   POST /api/settings/reminder-time
 * @desc    Update reminder time settings
 * @access  Public
 */
router.post('/reminder-time', async (req, res) => {
  try {
    const { reminder_time, reminder_timezone } = req.body;
    
    // Validate time format (HH:mm)
    if (reminder_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(reminder_time)) {
      return res.status(400).json({ 
        error: 'Invalid time format. Use HH:mm (24-hour format)' 
      });
    }

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    if (reminder_time !== undefined) {
      settings.reminder_time = reminder_time;
    }
    
    if (reminder_timezone !== undefined) {
      settings.reminder_timezone = reminder_timezone;
    }

    await settings.save();

    res.json({
      message: 'Reminder settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating reminder settings:', error);
    res.status(500).json({ 
      error: 'Failed to update reminder settings',
      details: error.message 
    });
  }
});

/**
 * @route   POST /api/settings/admin-info
 * @desc    Update admin information
 * @access  Public
 */
router.post('/admin-info', async (req, res) => {
  try {
    const { admin_phone, admin_name } = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    if (admin_phone !== undefined) {
      settings.admin_phone = admin_phone;
    }
    
    if (admin_name !== undefined) {
      settings.admin_name = admin_name;
    }

    await settings.save();

    res.json({
      message: 'Admin information updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating admin information:', error);
    res.status(500).json({ 
      error: 'Failed to update admin information',
      details: error.message 
    });
  }
});

/**
 * @route   POST /api/settings/weekly-day
 * @desc    Update weekly summary day
 * @access  Public
 */
router.post('/weekly-day', async (req, res) => {
  try {
    const { weekly_summary_day } = req.body;
    
    const validDays = ['sunday', 'monday', 'friday'];
    if (weekly_summary_day && !validDays.includes(weekly_summary_day.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid day. Valid options: sunday, monday, friday' 
      });
    }

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    if (weekly_summary_day !== undefined) {
      settings.weekly_summary_day = weekly_summary_day.toLowerCase();
    }

    await settings.save();

    res.json({
      message: 'Weekly summary day updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating weekly summary day:', error);
    res.status(500).json({ 
      error: 'Failed to update weekly summary day',
      details: error.message 
    });
  }
});

/**
 * @route   POST /api/settings/reset
 * @desc    Reset settings to defaults
 * @access  Public
 */
router.post('/reset', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (settings) {
      // Reset to default values
      settings.reminder_time = '18:00';
      settings.reminder_timezone = 'Asia/Kolkata';
      settings.weekly_summary_day = 'sunday';
      await settings.save();
    } else {
      // Create new settings with defaults
      settings = new Settings();
      await settings.save();
    }

    res.json({
      message: 'Settings reset to defaults',
      settings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ 
      error: 'Failed to reset settings',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/settings/timezones
 * @desc    Get list of common timezones
 * @access  Public
 */
router.get('/timezones', (req, res) => {
  const timezones = [
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];
  
  res.json(timezones);
});

module.exports = router;