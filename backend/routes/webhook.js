const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Contact = require('../models/Contact');
const streakLogic = require('../utils/streakLogic');
const crypto = require('crypto');

/**
 * @route   GET /api/webhook
 * @desc    Verify webhook subscription (Meta requirement)
 * @access  Public
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check if a token and mode is in the query string
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

/**
 * @route   POST /api/webhook
 * @desc    Handle incoming WhatsApp messages
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    // Verify webhook signature (optional but recommended)
    if (process.env.NODE_ENV === 'production') {
      const signature = req.headers['x-hub-signature-256'];
      if (!signature || !isValidSignature(req.body, signature)) {
        console.warn('Invalid webhook signature');
        return res.sendStatus(401);
      }
    }

    const body = req.body;

    // Check if this is a WhatsApp message
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];

      if (changes?.field === 'messages' && changes.value?.messages) {
        const messages = changes.value.messages;
        const metadata = changes.value.metadata;
        
        for (const message of messages) {
          await processIncomingMessage(message, metadata);
        }
      }
    }

    // Acknowledge receipt
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

/**
 * Process individual incoming message
 */
async function processIncomingMessage(message, metadata) {
  try {
    const from = message.from; // Phone number in E.164 format
    const messageId = message.id;
    const timestamp = new Date(parseInt(message.timestamp) * 1000);
    const messageDate = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    
    let messageText = '';

    // Extract message text based on message type
    if (message.type === 'text') {
      messageText = message.text?.body || '';
    } else if (message.type === 'image') {
      messageText = '[Image received]';
    } else if (message.type === 'document') {
      messageText = '[Document received]';
    } else {
      messageText = `[${message.type} message received]`;
    }

    console.log(`Received message from ${from}: ${messageText}`);

    // Find or create contact
    let contact = await Contact.findOne({ phone_number: from });
    
    if (!contact) {
      // Create new contact if not exists
      contact = new Contact({
        name: `User ${from.slice(-4)}`, // Use last 4 digits as name
        phone_number: from,
        active: true,
        reminder_enabled: true
      });
      await contact.save();
      console.log(`Created new contact for ${from}`);
    }

    // Check if we already have this message stored
    const existingMessage = await Message.findOne({
      sender_phone: from,
      timestamp: timestamp
    });

    if (existingMessage) {
      console.log('Duplicate message detected, skipping');
      return;
    }

    // Create message record
    const newMessage = new Message({
      sender_phone: from,
      message_text: messageText,
      timestamp: timestamp,
      message_date: messageDate,
      contact: contact._id
    });

    await newMessage.save();
    console.log(`Saved message from ${from} on ${messageDate}`);

    // Update contact's streak
    await streakLogic.handleNewMessage(contact._id);

    // Update contact's last seen
    contact.updated_at = new Date();
    await contact.save();

  } catch (error) {
    console.error('Error processing incoming message:', error);
    throw error;
  }
}

/**
 * Verify webhook signature (optional security measure)
 */
function isValidSignature(payload, signature) {
  try {
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', process.env.WHATSAPP_VERIFY_TOKEN)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * @route   POST /api/webhook/test
 * @desc    Test endpoint for webhook (development only)
 * @access  Public
 */
router.post('/test', async (req, res) => {
  try {
    const { phone_number, message_text } = req.body;
    
    if (!phone_number || !message_text) {
      return res.status(400).json({ 
        error: 'Phone number and message text are required' 
      });
    }

    // Simulate webhook payload structure
    const testPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'test',
        changes: [{
          field: 'messages',
          value: {
            metadata: {
              phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID
            },
            messages: [{
              from: phone_number,
              id: `test_${Date.now()}`,
              timestamp: Math.floor(Date.now() / 1000).toString(),
              type: 'text',
              text: {
                body: message_text
              }
            }]
          }
        }]
      }]
    };

    // Process the test message
    const entry = testPayload.entry[0];
    const changes = entry.changes[0];
    
    if (changes.field === 'messages' && changes.value.messages) {
      const messages = changes.value.messages;
      const metadata = changes.value.metadata;
      
      for (const message of messages) {
        await processIncomingMessage(message, metadata);
      }
    }

    res.json({ 
      message: 'Test message processed successfully',
      payload: testPayload 
    });
  } catch (error) {
    console.error('Error processing test webhook:', error);
    res.status(500).json({ 
      error: 'Failed to process test message',
      details: error.message 
    });
  }
});

module.exports = router;