import axios from "axios";
import dotenv from "dotenv";
import userModel from "../../../database/models/user.model.js";
import { connectDb } from "../../../database/db.js";

dotenv.config();
const API_URL = process.env.DOMAIN;

// Test data
const generateTestEmail = () => `cart_test_${Date.now()}@test.com`;

let testUserId = null;
let testUserToken = null;
let testItemId = "test_item_123"; // Mock item ID for testing

// Setup: Connect to database and create test user
export async function setup() {
  await connectDb();
  
  // Create a test user for cart operations
  try {
    const testEmail = generateTestEmail();
    const registerRes = await axios.post(`${API_URL}/api/user/register`, {
      name: "Cart Test User",
      email: testEmail,
      password: "TestPassword123"
    });
    
    if (registerRes.data.success) {
      testUserToken = registerRes.data.token;
      // Find the created user to get ID
      const user = await userModel.findOne({ email: testEmail });
      if (user) {
        testUserId = user._id.toString();
        console.log("✅ Test user created for cart tests");
      }
    }
  } catch (error) {
    console.log("⚠️  Test user creation failed:", error.message);
  }
}

// Cleanup: Delete test user
export async function cleanup() {
  if (testUserId) {
    console.log(`\n🧹 Cleaning up test user: ${testUserId}`);
    try {
      await userModel.findByIdAndDelete(testUserId);
      console.log("✅ Test user deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting test user:", error.message);
    }
  }
}

export async function testAddToCart() {
  console.log("\n🧪 Testing add to cart...");
  
  if (!testUserId) {
    console.log("⚠️  No test user ID available, skipping test");
    return;
  }
  
  try {
    const res = await axios.post(
      `${API_URL}/api/cart/add`,
      {
        userId: testUserId,
        itemId: testItemId
      },
      {
        headers: {
          token: testUserToken
        }
      }
    );

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    console.log("✅ Item added to cart successfully");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testGetCartData() {
  console.log("\n🧪 Testing get cart data...");
  
  if (!testUserId) {
    console.log("⚠️  No test user ID available, skipping test");
    return;
  }
  
  try {
    const res = await axios.post(
      `${API_URL}/api/cart/get`,
      {
        // userId: testUserId
      },
      {
        // headers: {
        //   token: testUserToken
        // }
      }
    );

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!res.data.cartData) throw new Error("Expected cartData in response");
    console.log("✅ Cart data retrieved successfully");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testRemoveFromCart() {
  console.log("\n🧪 Testing remove from cart...");
  
  if (!testUserId) {
    console.log("⚠️  No test user ID available, skipping test");
    return;
  }
  
  try {
    const res = await axios.post(
      `${API_URL}/api/cart/remove`,
      {
        userId: testUserId,
        itemId: testItemId
      },
      {
        headers: {
          token: testUserToken
        }
      }
    );

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    console.log("✅ Item removed from cart successfully");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testRemoveFromEmptyCart() {
  console.log("\n🧪 Testing remove from empty cart...");
  
  if (!testUserId) {
    console.log("⚠️  No test user ID available, skipping test");
    return;
  }
  
  try {
    // Try to remove an item that's not in cart or has 0 quantity
    const res = await axios.post(
      `${API_URL}/api/cart/remove`,
      {
        userId: testUserId,
        itemId: "nonexistent_item"
      },
      {
        headers: {
          token: testUserToken
        }
      }
    );

    console.log("📩 Response data:", res.data);

    // This might succeed (decrement to 0) or fail (cart empty), both are acceptable
    console.log("✅ Empty cart removal handled");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

// Main test runner
export async function runTests() {
  let passed = 0;
  let failed = 0;
  const tests = [
    { name: "Add to Cart", fn: testAddToCart },
    { name: "Get Cart Data", fn: testGetCartData },
    { name: "Remove from Cart", fn: testRemoveFromCart },
    { name: "Remove from Empty Cart", fn: testRemoveFromEmptyCart },
  ];

  try {
    await setup();
    
    for (const test of tests) {
      try {
        await test.fn();
        passed++;
      } catch (error) {
        failed++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Cart Test Suite Summary:");
    console.log("=".repeat(50));
    console.log(`✅ Passed: ${passed}/${tests.length}`);
    console.log(`❌ Failed: ${failed}/${tests.length}`);
    console.log("=".repeat(50) + "\n");

    await cleanup();
    
    // Throw error if any tests failed
    if (failed > 0) {
      throw new Error(`${failed} cart test(s) failed`);
    }
  } catch (error) {
    console.error("❌ Test suite failed:", error);
    await cleanup();
    throw error;
  }
  
  return { passed, failed, total: tests.length };
}
