const axios = require('axios');

const BASE_URL = 'http://localhost:3001/hostel/api/v1';

async function testAdminChargesAPI() {
  console.log('🧪 Testing Admin Charges API...\n');

  try {
    // Test 1: Get all admin charges
    console.log('1. Testing GET /admin-charges');
    const allCharges = await axios.get(`${BASE_URL}/admin-charges`);
    console.log(`✅ Status: ${allCharges.status}`);
    console.log(`✅ Found ${allCharges.data.data.length} admin charges`);
    console.log(`✅ Pagination: ${JSON.stringify(allCharges.data.pagination)}\n`);

    // Test 2: Get admin charges statistics
    console.log('2. Testing GET /admin-charges/stats');
    const stats = await axios.get(`${BASE_URL}/admin-charges/stats`);
    console.log(`✅ Status: ${stats.status}`);
    console.log(`✅ Stats: ${JSON.stringify(stats.data.data, null, 2)}\n`);

    // Test 3: Get charges for a specific student
    if (allCharges.data.data.length > 0) {
      const studentId = allCharges.data.data[0].studentId;
      console.log(`3. Testing GET /admin-charges/student/${studentId}`);
      const studentCharges = await axios.get(`${BASE_URL}/admin-charges/student/${studentId}`);
      console.log(`✅ Status: ${studentCharges.status}`);
      console.log(`✅ Found ${studentCharges.data.data.length} charges for student\n`);

      // Test 4: Get specific charge details
      const chargeId = allCharges.data.data[0].id;
      console.log(`4. Testing GET /admin-charges/${chargeId}`);
      const chargeDetails = await axios.get(`${BASE_URL}/admin-charges/${chargeId}`);
      console.log(`✅ Status: ${chargeDetails.status}`);
      console.log(`✅ Charge: ${chargeDetails.data.data.title} - $${chargeDetails.data.data.amount}\n`);

      // Test 5: Create a new admin charge
      console.log('5. Testing POST /admin-charges');
      const newCharge = {
        studentId: studentId,
        title: 'Test API Charge',
        description: 'This is a test charge created via API',
        amount: 100.50,
        chargeType: 'one-time',
        category: 'Test',
        createdBy: 'api-test',
        adminNotes: 'Created during API testing'
      };
      
      const createResponse = await axios.post(`${BASE_URL}/admin-charges`, newCharge);
      console.log(`✅ Status: ${createResponse.status}`);
      console.log(`✅ Created charge: ${createResponse.data.data.title} - $${createResponse.data.data.amount}`);
      const newChargeId = createResponse.data.data.id;
      console.log(`✅ New charge ID: ${newChargeId}\n`);

      // Test 6: Update the charge
      console.log(`6. Testing PATCH /admin-charges/${newChargeId}`);
      const updateData = {
        title: 'Updated Test API Charge',
        amount: 150.75,
        adminNotes: 'Updated during API testing'
      };
      
      const updateResponse = await axios.patch(`${BASE_URL}/admin-charges/${newChargeId}`, updateData);
      console.log(`✅ Status: ${updateResponse.status}`);
      console.log(`✅ Updated charge: ${updateResponse.data.data.title} - $${updateResponse.data.data.amount}\n`);

      // Test 7: Apply the charge (this will create a ledger entry)
      console.log(`7. Testing POST /admin-charges/${newChargeId}/apply`);
      const applyResponse = await axios.post(`${BASE_URL}/admin-charges/${newChargeId}/apply`);
      console.log(`✅ Status: ${applyResponse.status}`);
      console.log(`✅ Applied charge status: ${applyResponse.data.data.status}`);
      console.log(`✅ Applied date: ${applyResponse.data.data.appliedDate}\n`);

      // Test 8: Try to cancel an applied charge (should fail)
      console.log(`8. Testing POST /admin-charges/${newChargeId}/cancel (should fail)`);
      try {
        await axios.post(`${BASE_URL}/admin-charges/${newChargeId}/cancel`);
      } catch (error) {
        console.log(`✅ Expected error: ${error.response.data.message}\n`);
      }

      // Test 9: Create another charge and cancel it
      console.log('9. Testing charge cancellation');
      const cancelTestCharge = {
        studentId: studentId,
        title: 'Charge to Cancel',
        description: 'This charge will be cancelled',
        amount: 50.00,
        chargeType: 'one-time',
        category: 'Test',
        createdBy: 'api-test'
      };
      
      const cancelChargeResponse = await axios.post(`${BASE_URL}/admin-charges`, cancelTestCharge);
      const cancelChargeId = cancelChargeResponse.data.data.id;
      
      const cancelResponse = await axios.post(`${BASE_URL}/admin-charges/${cancelChargeId}/cancel`);
      console.log(`✅ Status: ${cancelResponse.status}`);
      console.log(`✅ Cancelled charge status: ${cancelResponse.data.data.status}\n`);

      // Test 10: Delete the cancelled charge
      console.log(`10. Testing DELETE /admin-charges/${cancelChargeId}`);
      const deleteResponse = await axios.delete(`${BASE_URL}/admin-charges/${cancelChargeId}`);
      console.log(`✅ Status: ${deleteResponse.status}`);
      console.log(`✅ Message: ${deleteResponse.data.message}\n`);
    }

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testAdminChargesAPI();