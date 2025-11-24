import axios from "axios";
import dotenv from "dotenv";
import restaurantModel from "../../../database/models/restaurant.model.js";
import { connectDb } from "../../../database/db.js";

dotenv.config();
const API_URL = process.env.DOMAIN;

// Test data
const generateTestEmail = () => `test_restaurant_${Date.now()}_${Math.random().toString(36).substring(7)}@restaurant.com`;

let testRestaurantEmail = null;
let testRestaurantPassword = null;
let testToken = null;

// Setup: Connect to database before tests
export async function setup() {
  await connectDb();
}

// Cleanup: Delete test restaurant after tests
export async function cleanup() {
  if (testRestaurantEmail) {
    console.log(`\n🧹 Cleaning up test restaurant: ${testRestaurantEmail}`);
    try {
      await restaurantModel.deleteOne({ email: testRestaurantEmail });
      console.log("✅ Test restaurant deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting test restaurant:", error.message);
    }
  }
}

export async function testRegisterRestaurant() {
  console.log("\n🧪 Testing restaurant registration...");
  testRestaurantEmail = generateTestEmail();
  testRestaurantPassword = "TestPass123!";
  
  try {
    const res = await axios.post(`${API_URL}/api/restaurant/register`, {
      name: "Test Restaurant",
      email: testRestaurantEmail,
      password: testRestaurantPassword,
      phoneNumber: "1234567890",
      address: "123 Test Street",
      city: "Test City",
      restaurantCode: `TEST${Date.now()}`,
    });

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!res.data.token) throw new Error("No token returned");
    
    testToken = res.data.token;
    console.log("✅ Restaurant registration verified");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testRegisterDuplicateEmail() {
  console.log("\n🧪 Testing restaurant registration with duplicate email...");
  
  try {
    const res = await axios.post(`${API_URL}/api/restaurant/register`, {
      name: "Duplicate Restaurant",
      email: testRestaurantEmail,
      password: "AnotherPassword123!",
      phoneNumber: "0987654321",
      address: "456 Another Street",
      city: "Another City",
      restaurantCode: `DUP${Date.now()}`,
    });

    console.log("📩 Response data:", res.data);

    if (res.data.success) throw new Error("Expected failure but got success");
    if (!res.data.message.includes("already")) {
      throw new Error("Expected 'already' message");
    }
    console.log("✅ Duplicate email handled correctly");
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testLoginRestaurantSuccess() {
  console.log("\n🧪 Testing restaurant login success...");
  
  try {
    const res = await axios.post(`${API_URL}/api/restaurant/login`, {
      email: testRestaurantEmail,
      password: testRestaurantPassword,
    });

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!res.data.token) throw new Error("No token returned");
    
    testToken = res.data.token;
    console.log("✅ Restaurant login success verified");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testLoginRestaurantWrongPassword() {
  console.log("\n🧪 Testing restaurant login with wrong password...");
  
  try {
    const res = await axios.post(`${API_URL}/api/restaurant/login`, {
      email: testRestaurantEmail,
      password: "WrongPassword123!",
    });

    console.log("📩 Response data:", res.data);

    if (res.data.success) throw new Error("Expected failure but got success");
    if (!res.data.message.includes("Incorrect password")) {
      throw new Error("Expected 'Incorrect password' message");
    }
    console.log("✅ Wrong password handled correctly");
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testLoginRestaurantNonExistent() {
  console.log("\n🧪 Testing restaurant login with non-existent email...");
  
  try {
    const res = await axios.post(`${API_URL}/api/restaurant/login`, {
      email: "nonexistent@restaurant.com",
      password: "Password123!",
    });

    console.log("📩 Response data:", res.data);

    if (res.data.success) throw new Error("Expected failure but got success");
    if (!res.data.message.includes("doesn't exist")) {
      throw new Error("Expected 'doesn't exist' message");
    }
    console.log("✅ Non-existent restaurant handled correctly");
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

// Main test runner
export async function runTests() {
  let passed = 0;
  let failed = 0;
  const failedTests = [];
  const tests = [
    { name: "Register Restaurant", fn: testRegisterRestaurant },
    { name: "Register Duplicate Email", fn: testRegisterDuplicateEmail },
    { name: "Login Restaurant Success", fn: testLoginRestaurantSuccess },
    { name: "Login Wrong Password", fn: testLoginRestaurantWrongPassword },
    { name: "Login Non-Existent Restaurant", fn: testLoginRestaurantNonExistent },
  ];

  try {
    await setup();
    
    for (const test of tests) {
      try {
        await test.fn();
        passed++;
      } catch (error) {
        failed++;
        failedTests.push(test.name);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Restaurant Test Suite Summary:");
    console.log("=".repeat(50));
    console.log(`✅ Passed: ${passed}/${tests.length}`);
    console.log(`❌ Failed: ${failed}/${tests.length}`);
    console.log("=".repeat(50) + "\n");

    if (failed > 0) {
      const error = new Error(`${failed} restaurant test(s) failed`);
      error.testResults = { passed, failed, total: tests.length, failedTests, suiteName: 'Restaurant' };
      throw error;
    }
  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
    if (!error.testResults) {
      error.testResults = { passed, failed, total: tests.length, failedTests, suiteName: 'Restaurant' };
    }
    throw error;
  } finally {
    await cleanup();
  }
  
  return { passed, failed, total: tests.length, failedTests, suiteName: 'Restaurant' };
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then(() => process.exit(0)).catch(() => process.exit(1));
}
