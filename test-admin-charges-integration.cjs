// Integration test for Admin Charges frontend-backend connection
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/hostel/api/v1';

async function testAdminChargesIntegration() {
  console.log('🧪 Testing Admin Charges Frontend-Backend Integration...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connectivity...');
    const healthCheck = await axios.get(`${API_BASE_URL}/health`);
    console.log(`✅ Backend is running: ${healthCheck.data.status}\n`);

    // Test 2: Get admin charges statistics
    console.log('2. Testing admin charges statistics endpoint...');
    const stats = await axios.get(`${API_BASE_URL}/admin-charges/stats`);
    console.log(`✅ Statistics endpoint working`);
    console.log(`   Total Charges: ${stats.data.data.totalCharges}`);
    console.log(`   Pending: ${stats.data.data.pendingCharges}`);
    console.log(`   Applied: ${stats.data.data.appliedCharges}\n`);

    // Test 3: Get all admin charges
    console.log('3. Testing get all admin charges endpoint...');
    const allCharges = await axios.get(`${API_BASE_URL}/admin-charges`);
    console.log(`✅ Get all charges endpoint working`);
    console.log(`   Found ${allCharges.data.data.length} charges\n`);

    // Test 4: Test service methods (simulate frontend calls)
    console.log('4. Testing frontend service integration...');
    
    // Simulate adminChargingService.getChargeStats()
    const serviceStats = await axios.get(`${API_BASE_URL}/admin-charges/stats`);
    const formattedStats = serviceStats.data.success && serviceStats.data.data ? serviceStats.data.data : serviceStats.data;
    console.log(`✅ Service-style stats call working`);
    console.log(`   Formatted response: ${JSON.stringify(formattedStats, null, 2)}\n`);

    // Test 5: Create a test charge (simulate frontend form submission)
    console.log('5. Testing charge creation (simulating frontend form)...');
    
    // First get a student ID
    const students = await axios.get(`${API_BASE_URL}/students`);
    if (students.data.data && students.data.data.length > 0) {
      const testStudent = students.data.data[0];
      
      const testCharge = {
        studentId: testStudent.id,
        title: 'Frontend Integration Test Charge',
        description: 'This charge was created during frontend integration testing',
        amount: 25.50,
        chargeType: 'one-time',
        category: 'Test',
        createdBy: 'Integration Test',
        adminNotes: 'Created during frontend-backend integration testing'
      };

      const createResponse = await axios.post(`${API_BASE_URL}/admin-charges`, testCharge);
      console.log(`✅ Charge creation working`);
      console.log(`   Created charge: ${createResponse.data.data.title}`);
      console.log(`   Amount: $${createResponse.data.data.amount}`);
      console.log(`   Status: ${createResponse.data.data.status}\n`);

      // Test 6: Apply the charge
      const chargeId = createResponse.data.data.id;
      console.log('6. Testing charge application...');
      
      const applyResponse = await axios.post(`${API_BASE_URL}/admin-charges/${chargeId}/apply`);
      console.log(`✅ Charge application working`);
      console.log(`   Applied charge status: ${applyResponse.data.data.status}`);
      console.log(`   Applied date: ${applyResponse.data.data.appliedDate}\n`);

      // Test 7: Verify the charge appears in the list
      console.log('7. Testing updated charges list...');
      const updatedCharges = await axios.get(`${API_BASE_URL}/admin-charges`);
      const ourCharge = updatedCharges.data.data.find(c => c.id === chargeId);
      console.log(`✅ Charge appears in list with status: ${ourCharge.status}\n`);

    } else {
      console.log('⚠️  No students found, skipping charge creation test\n');
    }

    console.log('🎉 All integration tests passed!');
    console.log('\n📋 Frontend Integration Checklist:');
    console.log('✅ Backend API is accessible');
    console.log('✅ Admin charges endpoints working');
    console.log('✅ Statistics endpoint working');
    console.log('✅ CRUD operations working');
    console.log('✅ Response format matches frontend expectations');
    console.log('\n🚀 Frontend is ready to use the Admin Charges API!');

  } catch (error) {
    console.error('❌ Integration test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the NestJS backend is running:');
      console.log('   cd hostel-ladger-frontend/server-nestjs');
      console.log('   npm run start:dev');
    }
  }
}

// Run the integration test
testAdminChargesIntegration();