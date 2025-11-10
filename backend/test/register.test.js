import axios from "axios";
import dotenv from "dotenv";
import userModel from "../../database/models/user.model.js";
import { connectDb } from "../../database/db.js";

dotenv.config();
const API_URL = process.env.DOMAIN;

// Test data - using a unique email for each test run
const generateTestEmail = () => `test_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;

let testUserEmail = null;

// Setup: Connect to database before tests
async function setup() {
  await connectDb();
}

// Cleanup: Delete test user after tests
async function cleanup() {
  if (testUserEmail) {
    console.log(`\n🧹 Cleaning up test user: ${testUserEmail}`);
    try {
      await userModel.deleteOne({ email: testUserEmail });
      console.log("✅ Test user deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting test user:", error.message);
    }
  }
}

export async function testRegisterSuccess() {
  console.log("\n🧪 Testing successful registration...");
  testUserEmail = generateTestEmail();
  
  try {
    const res = await axios.post(`${API_URL}/api/user/register`, {
      name: "Test User",
      email: testUserEmail,
      password: "TestPassword123",
    });

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!res.data.token) throw new Error("No token returned");
    console.log("✅ Registration success verified for:", res.data.user.email);
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testRegisterDuplicateEmail() {
  console.log("\n🧪 Testing registration with duplicate email...");
  
  try {
    // Use the same email from the previous test
    const res = await axios.post(`${API_URL}/api/user/register`, {
      name: "Test User 2",
      email: testUserEmail,
      password: "AnotherPassword123",
    });

    console.log("📩 Response data:", res.data);

    if (res.data.success) throw new Error("Expected failure but got success");
    if (!res.data.message.includes("already registered")) {
      throw new Error("Expected 'already registered' message");
    }
    console.log("✅ Duplicate email handled correctly");
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testRegisterInvalidEmail() {
  console.log("\n🧪 Testing registration with invalid email...");
  
  try {
    const res = await axios.post(`${API_URL}/api/user/register`, {
      name: "Test User",
      email: "invalid-email",
      password: "TestPassword123",
    });

    console.log("📩 Response data:", res.data);

    if (res.data.success) throw new Error("Expected failure but got success");
    if (!res.data.message.includes("valid email")) {
      throw new Error("Expected 'valid email' message");
    }
    console.log("✅ Invalid email handled correctly");
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testRegisterWeakPassword() {
  console.log("\n🧪 Testing registration with weak password...");
  
  try {
    const res = await axios.post(`${API_URL}/api/user/register`, {
      name: "Test User",
      email: generateTestEmail(),
      password: "123", // Too short
    });

    console.log("📩 Response data:", res.data);

    if (res.data.success) throw new Error("Expected failure but got success");
    if (!res.data.message.includes("strong password")) {
      throw new Error("Expected 'strong password' message");
    }
    console.log("✅ Weak password handled correctly");
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

// Main test runner
async function runTests() {
  try {
    await setup();
    
    await testRegisterSuccess();
    await testRegisterDuplicateEmail();
    await testRegisterInvalidEmail();
    await testRegisterWeakPassword();
    
    console.log("\n✅ All registration tests passed!");
  } catch (error) {
    console.error("\n❌ Test suite failed:", error.message);
    process.exit(1);
  } finally {
    await cleanup();
    process.exit(0);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
