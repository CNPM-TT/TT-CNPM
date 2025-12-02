// Test script to verify district-based order splitting logic
// This simulates placing an order with restaurants from different districts

import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Test Case 1: All restaurants in same district (District 1)
const testSameDistrict = async () => {
  console.log('\n📦 Test Case 1: All restaurants in same district');
  console.log('Expected: All items go to 1 hub in District 1\n');
  
  // Sample order with 2 restaurants both in District 1
  const orderData = {
    userId: '674abd044f1e0c9efc4b833e', // Replace with real user ID
    items: [
      {
        _id: 'item1',
        name: 'Burger',
        price: 100,
        quantity: 2,
        restaurantId: 'rest1_district1', // Restaurant in District 1
      },
      {
        _id: 'item2',
        name: 'Pizza',
        price: 150,
        quantity: 1,
        restaurantId: 'rest2_district1', // Another restaurant in District 1
      }
    ],
    amount: 350,
    address: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      street: '123 Test Street',
      district: 'District 1',
      city: 'Ho Chi Minh City'
    }
  };

  try {
    const response = await axios.post(`${API_URL}/api/order/cod`, orderData, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with real token
      }
    });
    
    console.log('✅ Order placed successfully');
    console.log('Order ID:', response.data.orderId);
    
    // Fetch delivery zones
    if (response.data.orderId) {
      const zonesResponse = await axios.get(`${API_URL}/api/order/${response.data.orderId}/delivery-zones`);
      console.log('\n📊 Delivery Zones:');
      console.log(JSON.stringify(zonesResponse.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

// Test Case 2: Restaurants in different districts
const testDifferentDistricts = async () => {
  console.log('\n📦 Test Case 2: Restaurants in different districts');
  console.log('Expected: Split into multiple zones, one per district\n');
  
  const orderData = {
    userId: '674abd044f1e0c9efc4b833e', // Replace with real user ID
    items: [
      {
        _id: 'item1',
        name: 'Burger',
        price: 100,
        quantity: 2,
        restaurantId: 'rest1_district1', // District 1
      },
      {
        _id: 'item2',
        name: 'Sushi',
        price: 200,
        quantity: 1,
        restaurantId: 'rest2_district3', // District 3
      },
      {
        _id: 'item3',
        name: 'Noodles',
        price: 80,
        quantity: 3,
        restaurantId: 'rest3_district7', // District 7
      }
    ],
    amount: 640,
    address: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      street: '123 Test Street',
      district: 'District 1',
      city: 'Ho Chi Minh City'
    }
  };

  try {
    const response = await axios.post(`${API_URL}/api/order/cod`, orderData, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ Order placed successfully');
    console.log('Order ID:', response.data.orderId);
    
    if (response.data.orderId) {
      const zonesResponse = await axios.get(`${API_URL}/api/order/${response.data.orderId}/delivery-zones`);
      console.log('\n📊 Delivery Zones:');
      console.log(JSON.stringify(zonesResponse.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

// Main test runner
const runTests = async () => {
  console.log('🧪 Testing District-Based Order Splitting Logic');
  console.log('='.repeat(50));
  
  // Run tests
  // Uncomment to run specific tests
  // await testSameDistrict();
  // await testDifferentDistricts();
  
  console.log('\n' + '='.repeat(50));
  console.log('📝 Instructions:');
  console.log('1. Update userId with a real user ID from your database');
  console.log('2. Update restaurantIds with real restaurant IDs');
  console.log('3. Add your authentication token');
  console.log('4. Uncomment the test you want to run');
  console.log('5. Run: node test-order-splitting.js');
};

runTests();
