const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const streakLogic = require('../utils/streakLogic');

/**
 * @route   POST /api/contacts
 * @desc    Create a new contact
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, phone_number, language, user_type, reminder_enabled } = req.body;

    // Validate required fields
    if (!name || !phone_number) {
      return res.status(400).json({ 
        error: 'Name and phone number are required' 
      });
    }

    // Check if contact already exists
    const existingContact = await Contact.findOne({ phone_number });
    if (existingContact) {
      return res.status(400).json({ 
        error: 'Contact with this phone number already exists' 
      });
    }

    // Create new contact
    const contact = new Contact({
      name,
      phone_number,
      language: language || 'en',
      user_type: user_type || 'general',
      reminder_enabled: reminder_enabled !== undefined ? reminder_enabled : true
    });

    await contact.save();

    // Update streaks after adding new contact
    await streakLogic.updateContactStreak(contact);

    res.status(201).json({
      message: 'Contact created successfully',
      contact
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ 
      error: 'Failed to create contact',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts with optional filtering
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { active, reminder_enabled, user_type } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (active !== undefined) {
      filter.active = active === 'true';
    }
    
    if (reminder_enabled !== undefined) {
      filter.reminder_enabled = reminder_enabled === 'true';
    }
    
    if (user_type) {
      filter.user_type = user_type;
    }

    const contacts = await Contact.find(filter).sort({ name: 1 });
    
    res.json({
      contacts,
      count: contacts.length
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contacts',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/contacts/:id
 * @desc    Get a specific contact by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ 
        error: 'Contact not found' 
      });
    }
    
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contact',
      details: error.message 
    });
  }
});

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update a contact
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, phone_number, active, reminder_enabled, language, user_type } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ 
        error: 'Contact not found' 
      });
    }

    // Update fields if provided
    if (name !== undefined) contact.name = name;
    if (phone_number !== undefined) contact.phone_number = phone_number;
    if (active !== undefined) contact.active = active;
    if (reminder_enabled !== undefined) contact.reminder_enabled = reminder_enabled;
    if (language !== undefined) contact.language = language;
    if (user_type !== undefined) contact.user_type = user_type;

    await contact.save();
    
    // Update streaks after modifying contact
    await streakLogic.updateContactStreak(contact);

    res.json({
      message: 'Contact updated successfully',
      contact
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ 
      error: 'Failed to update contact',
      details: error.message 
    });
  }
});

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete a contact
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ 
        error: 'Contact not found' 
      });
    }
    
    res.json({
      message: 'Contact deleted successfully',
      contact
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ 
      error: 'Failed to delete contact',
      details: error.message 
    });
  }
});

/**
 * @route   POST /api/contacts/bulk
 * @desc    Create multiple contacts at once
 * @access  Public
 */
router.post('/bulk', async (req, res) => {
  try {
    const { contacts } = req.body;
    
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ 
        error: 'Contacts array is required and cannot be empty' 
      });
    }

    const createdContacts = [];
    const errors = [];

    for (let i = 0; i < contacts.length; i++) {
      const contactData = contacts[i];
      
      try {
        // Validate required fields
        if (!contactData.name || !contactData.phone_number) {
          errors.push({
            index: i,
            error: 'Name and phone number are required'
          });
          continue;
        }

        // Check if contact already exists
        const existingContact = await Contact.findOne({ phone_number: contactData.phone_number });
        if (existingContact) {
          errors.push({
            index: i,
            error: 'Contact with this phone number already exists'
          });
          continue;
        }

        // Create contact
        const contact = new Contact({
          name: contactData.name,
          phone_number: contactData.phone_number,
          language: contactData.language || 'en',
          user_type: contactData.user_type || 'general',
          reminder_enabled: contactData.reminder_enabled !== undefined ? contactData.reminder_enabled : true
        });

        await contact.save();
        createdContacts.push(contact);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    // Update streaks for all newly created contacts
    for (const contact of createdContacts) {
      await streakLogic.updateContactStreak(contact);
    }

    res.status(201).json({
      message: `Created ${createdContacts.length} contacts`,
      created: createdContacts,
      errors,
      summary: {
        total: contacts.length,
        created: createdContacts.length,
        errors: errors.length
      }
    });
  } catch (error) {
    console.error('Error creating bulk contacts:', error);
    res.status(500).json({ 
      error: 'Failed to create contacts',
      details: error.message 
    });
  }
});

module.exports = router;