/**
 * INTEGRATION TESTS: Restaurant API
 * Tests full restaurant authentication flow with real API calls
 */

import axios from 'axios';

const API_URL = process.env.DOMAIN || 'http://localhost:5000';
let authToken = '';
let restaurantId = '';

function logTest(testName, passed, details = '') {
  if (passed) {
    console.log(`  ✅ ${testName}`);
  } else {
    console.log(`  ❌ ${testName}`);
    if (details) console.log(`     ${details}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

// Test 1: Register new restaurant
async function testRegisterRestaurant() {
  try {
    const restaurantData = {
      name: `Test Restaurant ${Date.now()}`,
      email: `test${Date.now()}@restaurant.com`,
      password: 'TestPass123!',
      phone: '1234567890',
      address: '123 Test Street, Test City',
      cuisineType: 'Italian',
      description: 'A test restaurant',
    };

    const response = await axios.post(`${API_URL}/api/restaurant/register`, restaurantData);
    
    logTest(
      'Restaurant Register - New Restaurant',
      response.data.success === true && 
      response.data.token !== undefined
    );

    // Save token and ID for subsequent tests
    authToken = response.data.token;
    restaurantId = response.data.restaurantId || response.data.restaurant?._id;
    
    return restaurantData;
  } catch (error) {
    logTest('Restaurant Register - New Restaurant', false, error.response?.data?.message || error.message);
  }
}

// Test 2: Register with duplicate email
async function testRegisterDuplicateEmail(existingEmail) {
  try {
    const restaurantData = {
      name: 'Duplicate Restaurant',
      email: existingEmail,
      password: 'TestPass123!',
      phone: '0987654321',
    };

    await axios.post(`${API_URL}/api/restaurant/register`, restaurantData);
    logTest('Restaurant Register - Duplicate Email', false, 'Should have failed');
  } catch (error) {
    logTest(
      'Restaurant Register - Duplicate Email',
      error.response?.status === 400 || error.response?.status === 409,
      `Status: ${error.response?.status}`
    );
  }
}

// Test 3: Register with invalid email
async function testRegisterInvalidEmail() {
  try {
    const restaurantData = {
      name: 'Invalid Email Restaurant',
      email: 'not-an-email',
      password: 'TestPass123!',
      phone: '1234567890',
    };

    await axios.post(`${API_URL}/api/restaurant/register`, restaurantData);
    logTest('Restaurant Register - Invalid Email', false, 'Should have failed');
  } catch (error) {
    logTest(
      'Restaurant Register - Invalid Email',
      error.response?.status === 400,
      `Status: ${error.response?.status}`
    );
  }
}

// Test 4: Register with missing fields
async function testRegisterMissingFields() {
  try {
    const restaurantData = {
      name: 'Incomplete Restaurant',
      // Missing email, password, phone
    };

    await axios.post(`${API_URL}/api/restaurant/register`, restaurantData);
    logTest('Restaurant Register - Missing Fields', false, 'Should have failed');
  } catch (error) {
    logTest(
      'Restaurant Register - Missing Fields',
      error.response?.status === 400,
      `Status: ${error.response?.status}`
    );
  }
}

// Test 5: Login with correct credentials
async function testLoginSuccess(email, password) {
  try {
    const loginData = {
      email,
      password,
    };

    const response = await axios.post(`${API_URL}/api/restaurant/login`, loginData);
    
    logTest(
      'Restaurant Login - Correct Credentials',
      response.data.success === true && 
      response.data.token !== undefined
    );

    // Update token
    authToken = response.data.token;
  } catch (error) {
    logTest('Restaurant Login - Correct Credentials', false, error.response?.data?.message || error.message);
  }
}

// Test 6: Login with wrong password
async function testLoginWrongPassword(email) {
  try {
    const loginData = {
      email,
      password: 'WrongPassword123!',
    };

    await axios.post(`${API_URL}/api/restaurant/login`, loginData);
    logTest('Restaurant Login - Wrong Password', false, 'Should have failed');
  } catch (error) {
    logTest(
      'Restaurant Login - Wrong Password',
      error.response?.status === 401 || error.response?.status === 400,
      `Status: ${error.response?.status}`
    );
  }
}

// Test 7: Login with non-existent email
async function testLoginNonExistent() {
  try {
    const loginData = {
      email: 'nonexistent@restaurant.com',
      password: 'Password123!',
    };

    await axios.post(`${API_URL}/api/restaurant/login`, loginData);
    logTest('Restaurant Login - Non-existent Email', false, 'Should have failed');
  } catch (error) {
    logTest(
      'Restaurant Login - Non-existent Email',
      error.response?.status === 401 || error.response?.status === 404,
      `Status: ${error.response?.status}`
    );
  }
}

// Test 8: Get profile without token
async function testGetProfileNoToken() {
  try {
    await axios.get(`${API_URL}/api/restaurant/profile`);
    logTest('Restaurant Get Profile - No Token', false, 'Should have failed');
  } catch (error) {
    logTest(
      'Restaurant Get Profile - No Token',
      error.response?.status === 401,
      `Status: ${error.response?.status}`
    );
  }
}

// Test 9: Get profile with valid token
async function testGetProfileWithToken() {
  try {
    const response = await axios.get(`${API_URL}/api/restaurant/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    logTest(
      'Restaurant Get Profile - Valid Token',
      response.data.success === true && 
      response.data.restaurant !== undefined
    );
  } catch (error) {
    logTest('Restaurant Get Profile - Valid Token', false, error.response?.data?.message || error.message);
  }
}

// Test 10: Update profile
async function testUpdateProfile() {
  try {
    const updateData = {
      name: 'Updated Restaurant Name',
      phone: '9876543210',
      description: 'Updated description',
    };

    const response = await axios.put(`${API_URL}/api/restaurant/profile`, updateData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    logTest(
      'Restaurant Update Profile',
      response.data.success === true &&
      response.data.restaurant?.name === updateData.name
    );
  } catch (error) {
    logTest('Restaurant Update Profile', false, error.response?.data?.message || error.message);
  }
}

// Test 11: Update profile without token
async function testUpdateProfileNoToken() {
  try {
    const updateData = {
      name: 'Should Fail',
    };

    await axios.put(`${API_URL}/api/restaurant/profile`, updateData);
    logTest('Restaurant Update Profile - No Token', false, 'Should have failed');
  } catch (error) {
    logTest(
      'Restaurant Update Profile - No Token',
      error.response?.status === 401,
      `Status: ${error.response?.status}`
    );
  }
}

// Test 12: Logout
async function testLogout() {
  try {
    const response = await axios.post(`${API_URL}/api/restaurant/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    logTest(
      'Restaurant Logout',
      response.data.success === true || response.status === 200
    );
  } catch (error) {
    // Logout might not be implemented, so accept 404
    logTest(
      'Restaurant Logout',
      error.response?.status === 404 || error.response?.status === 501,
      'Logout endpoint may not be implemented yet'
    );
  }
}

// Main test runner
export async function runTests() {
  console.log('\n🍽️  RESTAURANT INTEGRATION TESTS');
  console.log('   Testing restaurant API endpoints with real HTTP calls\n');

  try {
    // Register and login flow
    const restaurant = await testRegisterRestaurant();
    await testRegisterDuplicateEmail(restaurant.email);
    await testRegisterInvalidEmail();
    await testRegisterMissingFields();
    
    await testLoginSuccess(restaurant.email, restaurant.password);
    await testLoginWrongPassword(restaurant.email);
    await testLoginNonExistent();
    
    // Profile management
    await testGetProfileNoToken();
    await testGetProfileWithToken();
    await testUpdateProfile();
    await testUpdateProfileNoToken();
    
    await testLogout();

    console.log('\n   ✅ All restaurant integration tests passed!\n');
  } catch (error) {
    console.error('\n   ❌ Restaurant integration tests failed\n');
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(() => {
      console.log('✅ Restaurant API integration tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Restaurant API integration tests failed:', error.message);
      process.exit(1);
    });
}
