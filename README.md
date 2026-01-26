<<<<<<< HEAD
# Fitness Tracker - WhatsApp Diet Monitoring Application

A complete, scalable web application that tracks daily diet updates via WhatsApp, sends automated reminders, and provides analytics, motivation, and reports.

## 🚀 Features

### Core Functionality
- **WhatsApp Integration**: Official Meta WhatsApp Business Cloud API integration
- **Automated Reminders**: Smart reminder system with escalation logic
- **Streak Tracking**: Automatic streak calculation and motivation
- **Real-time Dashboard**: Live monitoring of diet updates
- **Analytics & Reports**: Comprehensive weekly summaries and trends
- **Multi-language Support**: English and Hindi templates
- **Contact Management**: Easy user administration

### Advanced Features
- **Cron-based Automation**: Scheduled reminders and weekly summaries
- **Retry Logic**: Exponential backoff for failed message delivery
- **Data Export**: CSV/JSON exports for all data types
- **Heatmap Calendar**: Visual representation of update patterns
- **Admin Insights**: Automated daily summaries for administrators

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API framework
- **MongoDB** + **Mongoose** - Database and ODM
- **node-cron** - Job scheduling
- **Axios** - HTTP client for WhatsApp API
- **Moment-timezone** - Timezone handling

### Frontend
- **React** + **React Router** - SPA framework
- **Bootstrap** + **React Bootstrap** - UI components
- **Chart.js** + **react-chartjs-2** - Data visualization
- **Material UI Icons** - Icon library

## 📁 Project Structure

```
fitness_track/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   │   ├── Contact.js
│   │   ├── Message.js
│   │   ├── MessageLog.js
│   │   ├── Settings.js
│   │   └── WeeklySummary.js
│   ├── routes/
│   │   ├── contacts.js
│   │   ├── dietStatus.js
│   │   ├── exports.js
│   │   ├── settings.js
│   │   ├── webhook.js
│   │   └── weeklySummary.js
│   ├── utils/
│   │   ├── cronJobs.js
│   │   ├── streakLogic.js
│   │   └── whatsappAPI.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navigation.js
│   │   ├── pages/
│   │   │   ├── CalendarView.js
│   │   │   ├── Contacts.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Reports.js
│   │   │   └── Settings.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── README.md
├── .env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud instance)
- WhatsApp Business Account with Cloud API access

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd fitness_track
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

4. **Environment Configuration**
```bash
# Copy and configure environment variables
cp ../.env.example ../.env
```

Edit the `.env` file with your configuration:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/fitness_track

# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_VERIFY_TOKEN=your_verify_token

# Server Configuration
PORT=5000
JWT_SECRET=your_jwt_secret_key

# Admin Configuration
ADMIN_PHONE=+1234567890
ADMIN_NAME=Admin User
```

### Running the Application

1. **Start MongoDB** (if using local instance)
```bash
mongod
```

2. **Start Backend Server**
```bash
cd backend
npm run dev
```

3. **Start Frontend Development Server**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📱 WhatsApp Setup

### 1. Create WhatsApp Business Account
1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Create a WhatsApp Business account
3. Get approved for WhatsApp Business API

### 2. Configure Webhook
1. In your Facebook Business Manager, navigate to WhatsApp → Configuration
2. Set Webhook URL: `https://your-domain.com/api/webhook`
3. Set Verify Token: (same as WHATSAPP_VERIFY_TOKEN in .env)
4. Subscribe to `messages` field

### 3. Create Message Templates
Create the following approved templates in your WhatsApp Business Manager:

#### DAILY_DIET_REMINDER
```
Hi {{1}}, you have not updated today's diet. Please send your diet update.
```

#### STREAK_MOTIVATION
```
🔥 Great job {{1}}! You are on a {{2}} day diet streak. Keep going!
```

#### WEEKLY_SUMMARY_NOTICE
```
Hi {{1}}, your weekly diet summary is ready.
```

### 4. Get API Credentials
From Facebook Developers Console:
- Access Token
- Phone Number ID
- Business Account ID

## 🔧 API Endpoints

### Contacts Management
```
POST   /api/contacts          # Create contact
GET    /api/contacts          # Get all contacts
PUT    /api/contacts/:id      # Update contact
DELETE /api/contacts/:id      # Delete contact
POST   /api/contacts/bulk     # Bulk create contacts
```

### Diet Status
```
GET    /api/diet-status               # Get status for specific date
GET    /api/diet-status/today         # Get today's status
GET    /api/diet-status/stats         # Get statistics
GET    /api/diet-status/history/:id   # Get contact history
GET    /api/diet-status/heatmap       # Get heatmap data
```

### Webhook
```
GET    /api/webhook           # Webhook verification
POST   /api/webhook           # Receive WhatsApp messages
POST   /api/webhook/test      # Test webhook (dev only)
```

### Settings
```
GET    /api/settings          # Get current settings
POST   /api/settings/reminder-time    # Update reminder time
POST   /api/settings/admin-info       # Update admin info
POST   /api/settings/weekly-day       # Update weekly summary day
POST   /api/settings/reset            # Reset to defaults
GET    /api/settings/timezones        # Get timezone list
```

### Weekly Summary
```
GET    /api/weekly-summary            # Get summaries
GET    /api/weekly-summary/current    # Get current week
GET    /api/weekly-summary/:id        # Get contact summaries
POST   /api/weekly-summary/generate   # Generate manually
GET    /api/weekly-summary/stats      # Get aggregated stats
```

### Exports
```
GET    /api/exports/csv/contacts          # Export contacts CSV
GET    /api/exports/csv/messages          # Export messages CSV
GET    /api/exports/csv/weekly-summaries  # Export summaries CSV
GET    /api/exports/csv/message-logs      # Export logs CSV
GET    /api/exports/json/contacts         # Export contacts JSON
GET    /api/exports/json/messages         # Export messages JSON
```

## 📊 Dashboard Features

### Today's Overview
- Real-time status of who updated/missed
- Current streak information
- Participation rates

### Contact Management
- Add/edit/delete contacts
- Configure languages and user types
- Enable/disable reminders

### Calendar View
- Heatmap visualization of update patterns
- Color-coded days (green/red/gray)
- Detailed date information

### Reports & Analytics
- Weekly performance charts
- Export capabilities (CSV/JSON)
- Trend analysis
- Completion statistics

### Settings
- Configure reminder timing
- Set admin contact information
- Adjust timezone settings
- Customize weekly summary schedule

## 🔒 Security & Compliance

### Implemented Security Measures
- Environment variable configuration
- Webhook signature verification
- Input validation and sanitization
- Rate limiting considerations
- Secure API practices

### WhatsApp Compliance
- Uses official Meta WhatsApp Business Cloud API only
- Approved message templates for all communications
- No scraping or unofficial APIs
- Proper opt-in/opt-out mechanisms
- Compliance with WhatsApp Business policies

## 🔄 Cron Jobs

### Daily Reminder Job
- Runs at configured reminder time
- Checks who hasn't updated today
- Sends personalized reminders
- Tracks reminder status

### Weekly Summary Job
- Runs every Sunday at midnight
- Generates weekly performance reports
- Calculates streaks and statistics
- Sends summary notifications

### Daily Admin Summary
- Runs daily at 11:59 PM
- Provides administrator overview
- Shows participation metrics
- Tracks system performance

## 📈 Streak Logic

### How Streaks Work
- **Increment**: When consecutive daily updates are received
- **Reset**: When a day is missed
- **Track**: Both current and longest streaks
- **Motivate**: Automatic encouragement at milestones (5, 10, 15+ days)

### Calculation Rules
- Consecutive days = continuous streak
- Same-day multiple messages = counted as one update
- Weekend/holiday gaps = streak interruption
- Manual streak adjustment capability

## 🐛 Troubleshooting

### Common Issues

**Webhook Not Receiving Messages**
- Verify webhook URL is publicly accessible
- Check verify token matches
- Ensure proper SSL certificate (HTTPS required)

**Reminders Not Sending**
- Confirm WhatsApp credentials are correct
- Check template approval status
- Verify contact phone numbers are in E.164 format
- Review message logs for errors

**Database Connection Issues**
- Ensure MongoDB is running
- Check connection string in .env
- Verify network connectivity
- Check MongoDB logs for errors

**Frontend Not Loading**
- Ensure backend server is running
- Check CORS configuration
- Verify API endpoints are accessible
- Check browser console for errors

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@example.com or join our Slack channel.

---

Built with ❤️ for fitness enthusiasts and health professionals
=======
# fitness_tracker
>>>>>>> 6b20a5afc5c03d29559c7ccf3d3384eb95c2a785
