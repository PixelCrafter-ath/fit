const axios = require('axios');

async function testApiEndpoints() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing Fitness Tracker API Endpoints...\n');
  
  const endpoints = [
    { method: 'GET', url: '/', description: 'Health Check' },
    { method: 'GET', url: '/api/contacts', description: 'Get Contacts' },
    { method: 'GET', url: '/api/diet-status/today', description: 'Today\'s Status' },
    { method: 'GET', url: '/api/diet-status/stats', description: 'Statistics' },
    { method: 'GET', url: '/api/settings', description: 'Settings' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.description}`);
      console.log(`URL: ${baseUrl}${endpoint.url}`);
      
      const response = await axios({
        method: endpoint.method,
        url: `${baseUrl}${endpoint.url}`,
        timeout: 5000
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`Response: ${JSON.stringify(response.data).substring(0, 100)}...\n`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Server not running at ${baseUrl}`);
        console.log('Please start the backend server first: cd backend && npm run dev\n');
        return;
      } else if (error.response) {
        console.log(`⚠️  Status: ${error.response.status}`);
        console.log(`Error: ${error.response.data?.error || 'Unknown error'}\n`);
      } else {
        console.log(`❌ Error: ${error.message}\n`);
      }
    }
  }
  
  console.log('🏁 API Testing Complete');
}

// Run the test
testApiEndpoints();