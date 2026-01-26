const moment = require('moment-timezone');
const Contact = require('../models/Contact');
const Message = require('../models/Message');

class StreakLogic {
  /**
   * Update streaks for all contacts based on their diet updates
   */
  async updateAllStreaks() {
    console.log('Updating all streaks...');

    try {
      const contacts = await Contact.find({ active: true });
      
      for (const contact of contacts) {
        await this.updateContactStreak(contact);
      }

      console.log(`Updated streaks for ${contacts.length} contacts`);
    } catch (error) {
      console.error('Error updating all streaks:', error);
      throw error;
    }
  }

  /**
   * Update streak for a specific contact
   */
  async updateContactStreak(contact) {
    try {
      // Get all messages for this contact ordered by date
      const messages = await Message.find({ contact: contact._id })
        .sort({ message_date: 1 })
        .select('message_date');

      if (messages.length === 0) {
        // No messages, reset streak
        contact.current_streak = 0;
        await contact.save();
        return contact;
      }

      // Calculate current streak
      let currentStreak = 0;
      let previousDate = null;
      let tempStreak = 0;

      for (const message of messages) {
        const currentDate = moment(message.message_date, 'YYYY-MM-DD');
        
        if (previousDate === null) {
          // First message
          tempStreak = 1;
        } else {
          const diffDays = currentDate.diff(previousDate, 'days');
          
          if (diffDays === 1) {
            // Consecutive day
            tempStreak++;
          } else if (diffDays === 0) {
            // Same day (multiple messages), continue current streak
            // Do nothing, just continue
          } else {
            // Gap in streak, reset temporary streak
            tempStreak = 1;
          }
        }
        
        previousDate = currentDate;
        currentStreak = tempStreak;
      }

      // Also calculate if today was updated
      const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
      const todayMessage = messages.some(msg => msg.message_date === today);
      
      if (todayMessage) {
        // If updated today, increment streak if yesterday was also updated
        const yesterday = moment().tz('Asia/Kolkata').subtract(1, 'day').format('YYYY-MM-DD');
        const yesterdayMessage = messages.some(msg => msg.message_date === yesterday);
        
        if (yesterdayMessage || contact.current_streak > 0) {
          currentStreak = contact.current_streak + 1;
        } else {
          currentStreak = 1; // First day of new streak
        }
      }

      // Update contact with new streak values
      contact.current_streak = currentStreak;
      if (currentStreak > contact.longest_streak) {
        contact.longest_streak = currentStreak;
      }

      await contact.save();
      return contact;
    } catch (error) {
      console.error(`Error updating streak for contact ${contact._id}:`, error);
      throw error;
    }
  }

  /**
   * Update streak for a contact when they send a new message
   */
  async handleNewMessage(contactId) {
    try {
      const contact = await Contact.findById(contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      // Update streak for this contact
      await this.updateContactStreak(contact);

      // Check if streak milestone is reached for motivation
      if (contact.current_streak > 0 && contact.current_streak % 5 === 0) {
        console.log(`Streak milestone reached for ${contact.name}: ${contact.current_streak} days`);
        // This would trigger a notification in the actual implementation
      }

      return contact;
    } catch (error) {
      console.error('Error handling new message for streak:', error);
      throw error;
    }
  }

  /**
   * Get diet status for all contacts for a specific date
   */
  async getDietStatusForDate(dateString = null) {
    if (!dateString) {
      dateString = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    }

    try {
      const contacts = await Contact.find({ active: true });
      const messages = await Message.find({ 
        message_date: dateString,
        sender_phone: { $in: contacts.map(c => c.phone_number) }
      }).select('sender_phone');

      const phoneNumbersThatUpdated = messages.map(msg => msg.sender_phone);

      const result = {
        date: dateString,
        received: [],
        not_received: [],
        total_contacts: contacts.length,
        updated_count: phoneNumbersThatUpdated.length,
        missed_count: contacts.length - phoneNumbersThatUpdated.length
      };

      contacts.forEach(contact => {
        if (phoneNumbersThatUpdated.includes(contact.phone_number)) {
          result.received.push({
            _id: contact._id,
            name: contact.name,
            phone_number: contact.phone_number,
            current_streak: contact.current_streak,
            user_type: contact.user_type
          });
        } else {
          result.not_received.push({
            _id: contact._id,
            name: contact.name,
            phone_number: contact.phone_number,
            current_streak: contact.current_streak,
            user_type: contact.user_type
          });
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting diet status for date:', error);
      throw error;
    }
  }

  /**
   * Get diet status history for a contact
   */
  async getDietHistory(contactId, startDate, endDate) {
    try {
      const contact = await Contact.findById(contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      // Get messages in the date range
      const messages = await Message.find({
        contact: contactId,
        message_date: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ message_date: 1 });

      // Create a map of dates with update status
      const dateRange = this.getDateRange(startDate, endDate);
      const messageDates = new Set(messages.map(msg => msg.message_date));

      const history = dateRange.map(date => ({
        date,
        updated: messageDates.has(date),
        message: messages.find(msg => msg.message_date === date)?.message_text || null
      }));

      return {
        contact: {
          _id: contact._id,
          name: contact.name,
          phone_number: contact.phone_number
        },
        history,
        stats: {
          total_days: dateRange.length,
          updated_days: messages.length,
          missed_days: dateRange.length - messages.length,
          streak: contact.current_streak
        }
      };
    } catch (error) {
      console.error('Error getting diet history:', error);
      throw error;
    }
  }

  /**
   * Helper to generate date range
   */
  getDateRange(startDate, endDate) {
    const start = moment(startDate, 'YYYY-MM-DD');
    const end = moment(endDate, 'YYYY-MM-DD');
    const dates = [];

    let currentDate = start.clone();
    while (currentDate.isSameOrBefore(end, 'day')) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'day');
    }

    return dates;
  }

  /**
   * Get weekly summary data for dashboard
   */
  async getWeeklySummaryData(weekStartDate) {
    try {
      // Get the week range
      const start = moment(weekStartDate, 'YYYY-MM-DD');
      const end = start.clone().endOf('week');
      
      const weekStartStr = start.format('YYYY-MM-DD');
      const weekEndStr = end.format('YYYY-MM-DD');

      // Get all contacts
      const contacts = await Contact.find({ active: true });
      
      // For each contact, calculate their weekly stats
      const weeklyData = [];
      
      for (const contact of contacts) {
        // Get messages for the week
        const messages = await Message.find({
          contact: contact._id,
          message_date: {
            $gte: weekStartStr,
            $lte: weekEndStr
          }
        });

        // Count days with updates
        const daysWithUpdates = [...new Set(messages.map(m => m.message_date))].length;
        
        weeklyData.push({
          contact: {
            _id: contact._id,
            name: contact.name,
            phone_number: contact.phone_number,
            user_type: contact.user_type
          },
          days_updated: daysWithUpdates,
          days_missed: 7 - daysWithUpdates,
          total_messages: messages.length,
          current_streak: contact.current_streak
        });
      }

      return {
        week_start: weekStartStr,
        week_end: weekEndStr,
        data: weeklyData,
        summary: {
          total_contacts: contacts.length,
          total_updates: weeklyData.reduce((sum, item) => sum + item.days_updated, 0),
          avg_updates_per_contact: weeklyData.reduce((sum, item) => sum + item.days_updated, 0) / contacts.length,
          completion_rate: (weeklyData.reduce((sum, item) => sum + item.days_updated, 0) / (contacts.length * 7)) * 100
        }
      };
    } catch (error) {
      console.error('Error getting weekly summary data:', error);
      throw error;
    }
  }
}

module.exports = new StreakLogic();