const cron = require('node-cron');
const moment = require('moment-timezone');
const Contact = require('../models/Contact');
const Message = require('../models/Message');
const Settings = require('../models/Settings');
const WeeklySummary = require('../models/WeeklySummary');
const whatsappAPI = require('./whatsappAPI');

class CronJobs {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start all cron jobs
   */
  startCronJobs() {
    console.log('Starting cron jobs...');

    // Daily reminder job - runs every day at configured time
    const dailyJob = cron.schedule('* * * * *', async () => { // For testing - will run every minute
      await this.runDailyReminders();
    }, {
      scheduled: false
    });

    // For production, use the actual configured time:
    // const dailyJob = cron.schedule('0 18 * * *', async () => { // 6 PM daily
    //   await this.runDailyReminders();
    // }, {
    //   scheduled: false
    // });

    // Weekly summary job - runs every Sunday at midnight
    const weeklyJob = cron.schedule('0 0 * * 0', async () => {
      await this.generateWeeklySummaries();
    }, {
      scheduled: false
    });

    // Daily admin summary job - runs every day at 11:59 PM
    const dailyAdminJob = cron.schedule('59 23 * * *', async () => {
      await this.sendDailyAdminSummary();
    }, {
      scheduled: false
    });

    // Store job references
    this.jobs.push(dailyJob, weeklyJob, dailyAdminJob);

    // Start all jobs
    dailyJob.start();
    weeklyJob.start();
    dailyAdminJob.start();

    console.log('All cron jobs started successfully');
  }

  /**
   * Run daily reminder checks
   */
  async runDailyReminders() {
    console.log('Running daily reminder checks...');

    try {
      // Get today's date in YYYY-MM-DD format
      const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
      
      // Get current settings
      let settings = await Settings.findOne();
      if (!settings) {
        // Create default settings if not exists
        settings = new Settings();
        await settings.save();
      }

      // Check if it's the right time to send reminders
      const currentTime = moment().tz(settings.reminder_timezone).format('HH:mm');
      if (currentTime !== settings.reminder_time && process.env.NODE_ENV === 'production') {
        return; // Not the right time
      }

      // Get all active contacts
      const contacts = await Contact.find({ active: true, reminder_enabled: true });

      // Check who has sent updates today
      const todayMessages = await Message.find({
        message_date: today,
        sender_phone: { $in: contacts.map(c => c.phone_number) }
      }).select('sender_phone');

      const phonesThatUpdated = todayMessages.map(msg => msg.sender_phone);
      const contactsWhoDidNotUpdate = contacts.filter(
        contact => !phonesThatUpdated.includes(contact.phone_number)
      );

      console.log(`Found ${contacts.length} active contacts`);
      console.log(`${todayMessages.length} contacts updated today`);
      console.log(`${contactsWhoDidNotUpdate.length} contacts did not update`);

      // Send reminders to those who didn't update
      for (const contact of contactsWhoDidNotUpdate) {
        // Check if we already sent a reminder today
        if (contact.last_reminder_date && 
            moment(contact.last_reminder_date).tz(settings.reminder_timezone).format('YYYY-MM-DD') === today) {
          continue; // Already sent today
        }

        try {
          // Determine template based on streak
          let templateName = 'DAILY_DIET_REMINDER';
          
          // Update contact's last reminder date
          contact.last_reminder_date = new Date();
          await contact.save();

          // Send reminder with retry logic
          await whatsappAPI.sendMessageWithRetry(
            contact.phone_number,
            templateName,
            contact.language === 'hi' ? 'hi_IN' : 'en_US',
            [{ type: 'text', text: contact.name }],
            contact._id
          );

          console.log(`Reminder sent to ${contact.name} (${contact.phone_number})`);
        } catch (error) {
          console.error(`Failed to send reminder to ${contact.name}:`, error.message);
        }
      }

      // Send streak motivation messages
      await this.sendStreakMotivations(contacts);
      
    } catch (error) {
      console.error('Error in daily reminder job:', error);
    }
  }

  /**
   * Send streak motivation messages
   */
  async sendStreakMotivations(contacts) {
    for (const contact of contacts) {
      // Send motivation if streak reaches multiples of 5
      if (contact.current_streak > 0 && contact.current_streak % 5 === 0) {
        try {
          await whatsappAPI.sendMessageWithRetry(
            contact.phone_number,
            'STREAK_MOTIVATION',
            contact.language === 'hi' ? 'hi_IN' : 'en_US',
            [
              { type: 'text', text: contact.name },
              { type: 'text', text: contact.current_streak.toString() }
            ],
            contact._id
          );
          
          console.log(`Streak motivation sent to ${contact.name} (streak: ${contact.current_streak})`);
        } catch (error) {
          console.error(`Failed to send streak motivation to ${contact.name}:`, error.message);
        }
      }
    }
  }

  /**
   * Generate weekly summaries
   */
  async generateWeeklySummaries() {
    console.log('Generating weekly summaries...');

    try {
      const today = moment().tz('Asia/Kolkata');
      const weekStart = today.clone().startOf('week').format('YYYY-MM-DD');
      const weekEnd = today.clone().endOf('week').format('YYYY-MM-DD');

      // Get all active contacts
      const contacts = await Contact.find({ active: true });

      for (const contact of contacts) {
        // Calculate stats for the week
        const weekMessages = await Message.find({
          contact: contact._id,
          message_date: {
            $gte: weekStart,
            $lte: weekEnd
          }
        });

        const daysUpdated = weekMessages.length;
        const totalExpectedDays = 7; // Assuming 7 days in a week
        const daysMissed = totalExpectedDays - daysUpdated;

        // Calculate average streak (simplified calculation)
        const averageStreak = contact.current_streak || 0;

        // Create weekly summary record
        const weeklySummary = new WeeklySummary({
          week_start_date: weekStart,
          week_end_date: weekEnd,
          contact: contact._id,
          total_expected_days: totalExpectedDays,
          days_updated: daysUpdated,
          days_missed: daysMissed,
          average_streak: averageStreak,
          summary_data: {
            week_start: weekStart,
            week_end: weekEnd,
            daily_updates: weekMessages.map(msg => ({
              date: msg.message_date,
              text: msg.message_text.substring(0, 100) + '...' // First 100 chars
            }))
          }
        });

        await weeklySummary.save();

        // Send notification to user about summary
        try {
          await whatsappAPI.sendMessageWithRetry(
            contact.phone_number,
            'WEEKLY_SUMMARY_NOTICE',
            contact.language === 'hi' ? 'hi_IN' : 'en_US',
            [{ type: 'text', text: contact.name }],
            contact._id
          );
        } catch (error) {
          console.error(`Failed to send summary notice to ${contact.name}:`, error.message);
        }
      }

      console.log(`Generated weekly summaries for ${contacts.length} contacts`);
    } catch (error) {
      console.error('Error generating weekly summaries:', error);
    }
  }

  /**
   * Send daily admin summary
   */
  async sendDailyAdminSummary() {
    console.log('Sending daily admin summary...');

    try {
      const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
      
      // Get settings to find admin info
      const settings = await Settings.findOne();
      if (!settings || !settings.admin_phone) {
        console.log('Admin phone not configured, skipping admin summary');
        return;
      }

      // Get statistics
      const totalContacts = await Contact.countDocuments({ active: true });
      const todayMessages = await Message.countDocuments({ message_date: today });
      const totalContactsWhoMissed = await Contact.countDocuments({ 
        active: true,
        reminder_enabled: true 
      });
      
      // Calculate who missed today
      const todayMessagePhones = await Message.distinct('sender_phone', { message_date: today });
      const contactsWhoMissed = totalContactsWhoMissed - todayMessagePhones.length;

      // Calculate reminder success rate
      const recentLogs = await MessageLog.countDocuments({
        timestamp: { $gte: new Date(today) },
        status: { $in: ['sent', 'delivered', 'read'] }
      });
      const totalReminderAttempts = await MessageLog.countDocuments({
        timestamp: { $gte: new Date(today) },
        template: 'DAILY_DIET_REMINDER'
      });
      
      const successRate = totalReminderAttempts > 0 
        ? Math.round((recentLogs / totalReminderAttempts) * 100) 
        : 0;

      // Prepare summary message
      const summaryMessage = `📊 Daily Summary - ${today}
      
👥 Total Active Users: ${totalContacts}
✅ Updated Today: ${todayMessages}
❌ Missed Today: ${contactsWhoMissed}
📈 Reminder Success Rate: ${successRate}%`;

      // Send to admin (would use WhatsApp API in production)
      console.log('Daily Admin Summary:');
      console.log(summaryMessage);
      
      // In a real implementation, you would send this to the admin via WhatsApp or email
      // await whatsappAPI.sendMessageWithRetry(
      //   settings.admin_phone,
      //   'DAILY_ADMIN_SUMMARY',
      //   'en_US',
      //   [
      //     { type: 'text', text: settings.admin_name || 'Admin' },
      //     { type: 'text', text: summaryMessage }
      //   ]
      // );

    } catch (error) {
      console.error('Error sending daily admin summary:', error);
    }
  }

  /**
   * Stop all cron jobs
   */
  stopCronJobs() {
    console.log('Stopping cron jobs...');
    this.jobs.forEach(job => job.stop());
    console.log('All cron jobs stopped');
  }
}

module.exports = new CronJobs();