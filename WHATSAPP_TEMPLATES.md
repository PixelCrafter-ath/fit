# WhatsApp Template Setup Guide

This guide walks you through setting up the required WhatsApp message templates for the Fitness Tracker application.

## 📋 Required Templates

You need to create 3 approved message templates in your WhatsApp Business Manager:

### 1. DAILY_DIET_REMINDER
**Purpose**: Sent to users who haven't updated their diet for the day

**Template Content**:
```
Hi {{1}}, you have not updated today's diet. Please send your diet update.
```

**Variables**:
- `{{1}}` - User's name

**Category**: Utility  
**Language**: English (en_US) and Hindi (hi_IN)

### 2. STREAK_MOTIVATION
**Purpose**: Sent to users who reach streak milestones (every 5 days)

**Template Content**:
```
🔥 Great job {{1}}! You are on a {{2}} day diet streak. Keep going!
```

**Variables**:
- `{{1}}` - User's name
- `{{2}}` - Current streak count

**Category**: Marketing  
**Language**: English (en_US) and Hindi (hi_IN)

### 3. WEEKLY_SUMMARY_NOTICE
**Purpose**: Notifies users that their weekly summary is ready

**Template Content**:
```
Hi {{1}}, your weekly diet summary is ready.
```

**Variables**:
- `{{1}}` - User's name

**Category**: Utility  
**Language**: English (en_US) and Hindi (hi_IN)

## 🔧 Setup Instructions

### Step 1: Access WhatsApp Business Manager
1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to your WhatsApp Business account
3. Click on "Messages" in the left sidebar

### Step 2: Create New Template
1. Click "Create Message Template"
2. Select "Business" as template type
3. Choose appropriate category:
   - **Utility** for DAILY_DIET_REMINDER and WEEKLY_SUMMARY_NOTICE
   - **Marketing** for STREAK_MOTIVATION

### Step 3: Configure Template Details
For each template, provide:

**Template Name**: Exact name as listed above (case-sensitive)
**Language**: 
- Primary: English (US) - `en_US`
- Additional: Hindi (India) - `hi_IN`

**Header** (Optional): None required for these templates

**Body**: Use the exact content provided above

**Footer**: Add your business information
Example: "Powered by Fitness Tracker"

**Buttons**: None required

### Step 4: Submit for Approval
1. Review all template details
2. Click "Submit"
3. Wait for Facebook review (typically 24-48 hours)

## 🌍 Multi-language Setup

### English Templates
Use the exact English content provided above.

### Hindi Templates
Translate the templates to Hindi while maintaining the same structure:

**DAILY_DIET_REMINDER (Hindi)**:
```
नमस्ते {{1}}, आपने आज का डाइट अपडेट नहीं भेजा है। कृपया अपना डाइट अपडेट भेजें।
```

**STREAK_MOTIVATION (Hindi)**:
```
🔥 बधाई हो {{1}}! आप {{2}} दिनों से लगातार डाइट अपडेट कर रहे हैं। ऐसे ही जारी रखें!
```

**WEEKLY_SUMMARY_NOTICE (Hindi)**:
```
नमस्ते {{1}}, आपका साप्ताहिक डाइट सारांश तैयार है।
```

## ✅ Verification Checklist

Before using the application, ensure:

- [ ] All 3 templates are created
- [ ] Templates are approved by Facebook
- [ ] Both English and Hindi versions exist
- [ ] Template names match exactly (case-sensitive)
- [ ] Variable placeholders are correct
- [ ] Categories are set appropriately
- [ ] Footer contains business information

## ⚠️ Important Notes

1. **Exact Names Required**: Template names must match exactly as provided
2. **Variable Count**: Ensure correct number of variables in each template
3. **Approval Time**: Allow 24-48 hours for template approval
4. **Testing**: Test templates in development before production use
5. **Updates**: Any template changes require re-approval
6. **Limits**: Facebook has daily message limits for templates

## 🆘 Troubleshooting

### Template Rejected
Common reasons and solutions:
- **Inappropriate content**: Ensure templates are professional and helpful
- **Too promotional**: Use Utility category for informational templates
- **Missing variables**: Double-check variable placeholders
- **Formatting issues**: Remove special characters that aren't supported

### Messages Not Sending
- Verify template approval status
- Check template names in code match exactly
- Ensure proper language codes are used
- Confirm WhatsApp Business account is active

### Language Issues
- Make sure both language versions exist
- Verify language codes are correct (`en_US`, `hi_IN`)
- Test both English and Hindi templates separately

## 📞 Support Resources

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Template Guidelines](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Facebook Developer Support](https://developers.facebook.com/support/)