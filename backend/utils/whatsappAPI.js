const axios = require('axios');
const MessageLog = require('../models/MessageLog');
const Contact = require('../models/Contact');

class WhatsAppAPI {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.baseUrl = 'https://graph.facebook.com/v17.0';
  }

  /**
   * Send a message using WhatsApp Business API
   */
  async sendMessage(phoneNumber, templateName, languageCode = 'en_US', params = []) {
    // Mock implementation for testing without actual WhatsApp credentials
    console.log('📱 MOCK WhatsApp Message:');
    console.log('To:', phoneNumber);
    console.log('Template:', templateName);
    console.log('Params:', params);
    
    // Simulate successful send for testing
    if (process.env.MOCK_WHATSAPP === 'true') {
      console.log('✅ Mock message sent successfully!');
      return {
        success: true,
        messageId: 'mock_' + Date.now(),
        data: {
          messages: [{ id: 'mock_' + Date.now() }]
        }
      };
    }
    
    // Actual WhatsApp API implementation
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;

    try {
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode
            },
            components: [
              {
                type: 'body',
                parameters: params
              }
            ]
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0]?.id,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send daily diet reminder
   */
  async sendDailyReminder(contact) {
    const templateParams = [
      {
        type: 'text',
        text: contact.name
      }
    ];

    return await this.sendMessage(
      contact.phone_number,
      'DAILY_DIET_REMINDER',
      contact.language === 'hi' ? 'hi_IN' : 'en_US',
      templateParams
    );
  }

  /**
   * Send streak motivation message
   */
  async sendStreakMotivation(contact) {
    const templateParams = [
      {
        type: 'text',
        text: contact.name
      },
      {
        type: 'text',
        text: contact.current_streak.toString()
      }
    ];

    return await this.sendMessage(
      contact.phone_number,
      'STREAK_MOTIVATION',
      contact.language === 'hi' ? 'hi_IN' : 'en_US',
      templateParams
    );
  }

  /**
   * Send weekly summary notice
   */
  async sendWeeklySummaryNotice(contact) {
    const templateParams = [
      {
        type: 'text',
        text: contact.name
      }
    ];

    return await this.sendMessage(
      contact.phone_number,
      'WEEKLY_SUMMARY_NOTICE',
      contact.language === 'hi' ? 'hi_IN' : 'en_US',
      templateParams
    );
  }

  /**
   * Log message status
   */
  async logMessage(phone, template, status, error = null, contactId = null) {
    const logEntry = new MessageLog({
      phone,
      template,
      status,
      error,
      contact: contactId
    });

    await logEntry.save();
    return logEntry;
  }

  /**
   * Process message with retry logic
   */
  async sendMessageWithRetry(phoneNumber, templateName, languageCode = 'en_US', params = [], contactId = null) {
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 5000; // 5 seconds

    while (retryCount <= maxRetries) {
      try {
        // Log pending status
        await this.logMessage(phoneNumber, templateName, 'pending', null, contactId);

        const result = await this.sendMessage(phoneNumber, templateName, languageCode, params);

        // Update log with success status
        await MessageLog.findOneAndUpdate(
          { phone: phoneNumber, template: templateName, status: 'pending' },
          { status: 'sent', retry_count: retryCount },
          { new: true }
        );

        return { success: true, data: result };
      } catch (error) {
        retryCount++;
        
        // Update log with failure status
        await MessageLog.findOneAndUpdate(
          { phone: phoneNumber, template: templateName, status: 'pending' },
          { 
            status: 'failed', 
            retry_count: retryCount,
            error: error.response?.data?.error?.message || error.message
          },
          { new: true }
        );

        if (retryCount > maxRetries) {
          console.error(`Failed to send message after ${maxRetries} retries:`, error.message);
          return { success: false, error: error.message };
        }

        // Exponential backoff: 5s, 15s, 45s
        const delay = baseDelay * Math.pow(3, retryCount - 1);
        console.log(`Retry ${retryCount}/${maxRetries} in ${delay}ms for ${phoneNumber}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

module.exports = new WhatsAppAPI();