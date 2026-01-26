require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('./utils/cronJobs'); // Import cron jobs
const webhookRoutes = require('./routes/webhook');
const contactRoutes = require('./routes/contacts');
const dietStatusRoutes = require('./routes/dietStatus');
const settingsRoutes = require('./routes/settings');
const weeklySummaryRoutes = require('./routes/weeklySummary');
const exportsRoutes = require('./routes/exports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/diet-status', dietStatusRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/weekly-summary', weeklySummaryRoutes);
app.use('/api/exports', exportsRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Fitness Tracking API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB and start server
const connectDB = async () => {
  try {
    // Try to connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('⚠️  MongoDB connection failed. Some features may be limited.');
    console.log('💡 Tip: Sign up for free MongoDB Atlas at https://www.mongodb.com/cloud/atlas');
    return false;
  }
};

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.log('\n📋 MongoDB Setup Instructions:');
    console.log('1. Install MongoDB locally, or');
    console.log('2. Sign up for free MongoDB Atlas at https://www.mongodb.com/cloud/atlas');
    console.log('3. Update MONGODB_URI in .env file');
    console.log('4. Restart the server\n');
  }
  
  // Start cron jobs
  cron.startCronJobs();
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`📱 WhatsApp Webhook URL: http://localhost:${PORT}/api/webhook`);
    console.log(`📊 API Health Check: http://localhost:${PORT}/`);
    console.log('\n🔧 For full functionality, configure WhatsApp API credentials in .env\n');
  });
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});