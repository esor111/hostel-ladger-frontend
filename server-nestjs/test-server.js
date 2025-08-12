const axios = require('axios');

async function testServer() {
  try {
    const response = await axios.get('http://localhost:3001/hostel/api/v1/health');
    console.log('✅ Server is running:', response.data);
    
    // Test admin charges endpoint
    const adminCharges = await axios.get('http://localhost:3001/hostel/api/v1/admin-charges');
    console.log('✅ Admin charges endpoint working:', adminCharges.status);
  } catch (error) {
    console.log('❌ Server error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testServer();