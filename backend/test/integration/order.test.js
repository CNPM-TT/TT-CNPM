import axios from "axios";
import dotenv from "dotenv";
import userModel from "../../database/models/user.model.js";
import orderModel from "../../database/models/order.model.js";
import { connectDb } from "../../database/db.js";

dotenv.config();
const API_URL = process.env.DOMAIN;

// Test data
let testUserEmail = null;
let testUserId = null;
let testToken = null;
let testOrderId = null;

// Setup: Create a test user and login
export async function setup() {
  await connectDb();
  
  // Create unique test user
  testUserEmail = `test_order_${Date.now()}@test.com`;
  
  console.log("\n🔧 Setting up test user for order tests...");
  
  // Register test user
  const registerRes = await axios.post(`${API_URL}/api/user/register`, {
    name: "Order Test User",
    email: testUserEmail,
    password: "TestPassword123",
  });
  
  if (!registerRes.data.success) {
    throw new Error("Failed to create test user");
  }
  
  testToken = registerRes.data.token;
  
  // Get user ID from token or database
  const user = await userModel.findOne({ email: testUserEmail });
  testUserId = user._id.toString();
  
  console.log("✅ Test user created successfully");
}

// Cleanup: Delete test user and test orders
export async function cleanup() {
  console.log("\n🧹 Cleaning up test data...");
  
  try {
    if (testUserId) {
      await userModel.deleteOne({ _id: testUserId });
      await orderModel.deleteMany({ userId: testUserId });
      console.log("✅ Test user and orders deleted successfully");
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
  }
}

export async function testPlaceOrder() {
  console.log("\n🧪 Testing place order...");
  
  try {
    const res = await axios.post(
      `${API_URL}/api/order/placeorder`,
      {
        userId: testUserId,
        items: [
          { _id: "item1", name: "Test Food", price: 100, quantity: 2 },
        ],
        amount: 200,
        address: {
          name: "Order Test User",
          email: testUserEmail,
          street: "123 Test St",
          city: "Test City",
          phone: "1234567890",
        },
      },
      {
        headers: { token: testToken },
      }
    );

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!res.data.session_url) throw new Error("No session URL returned");
    
    // Extract order ID from session URL
    const urlParams = new URLSearchParams(res.data.session_url.split("?")[1]);
    testOrderId = urlParams.get("orderId");
    
    console.log("✅ Place order success, Order ID:", testOrderId);
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testVerifyOrderSuccess() {
  console.log("\n🧪 Testing verify order (success)...");
  
  try {
    if (!testOrderId) {
      throw new Error("No test order ID available. Run testPlaceOrder first.");
    }
    
    const res = await axios.post(`${API_URL}/api/order/verify`, {
      orderId: testOrderId,
      success: "true",
    });

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!res.data.message.includes("Order Placed")) {
      throw new Error("Expected 'Order Placed' message");
    }
    
    // Check if order payment is updated
    const order = await orderModel.findById(testOrderId);
    if (!order.payment) {
      throw new Error("Order payment not updated to true");
    }
    
    console.log("✅ Verify order success verified");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testUserOrder() {
  console.log("\n🧪 Testing get user orders...");
  
  try {
    const res = await axios.post(
      `${API_URL}/api/order/userorder`,
      {
        userId: testUserId,
      },
      {
        headers: { token: testToken },
      }
    );

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!Array.isArray(res.data.data)) throw new Error("Expected orders array");
    
    // Should have at least the order we just verified
    if (res.data.data.length === 0) {
      throw new Error("Expected at least 1 order");
    }
    
    console.log("✅ User orders fetched successfully, Count:", res.data.data.length);
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testListOrders() {
  console.log("\n🧪 Testing list all orders (admin)...");
  
  try {
    const res = await axios.get(`${API_URL}/api/order/list`);

    console.log("📩 Response data (showing count):", { success: res.data.success, count: res.data.data?.length });

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!Array.isArray(res.data.data)) throw new Error("Expected orders array");
    
    console.log("✅ All orders fetched successfully, Total count:", res.data.data.length);
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testUpdateStatus() {
  console.log("\n🧪 Testing update order status...");
  
  try {
    if (!testOrderId) {
      throw new Error("No test order ID available. Run testPlaceOrder first.");
    }
    
    const res = await axios.post(`${API_URL}/api/order/update`, {
      orderId: testOrderId,
      status: "Food Processing",
    });

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!res.data.message.includes("updated")) {
      throw new Error("Expected 'updated' message");
    }
    
    // Check if order status is updated
    const order = await orderModel.findById(testOrderId);
    if (order.status !== "Food Processing") {
      throw new Error("Order status not updated correctly");
    }
    
    console.log("✅ Order status updated successfully");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testVerifyOrderFailure() {
  console.log("\n🧪 Testing verify order (failure - order deletion)...");
  
  try {
    // Create a new order for deletion test
    const placeRes = await axios.post(
      `${API_URL}/api/order/placeorder`,
      {
        userId: testUserId,
        items: [
          { _id: "item2", name: "Test Food 2", price: 50, quantity: 1 },
        ],
        amount: 50,
        address: {
          name: "Order Test User",
          email: testUserEmail,
          street: "123 Test St",
          city: "Test City",
          phone: "1234567890",
        },
      },
      {
        headers: { token: testToken },
      }
    );
    
    const urlParams = new URLSearchParams(placeRes.data.session_url.split("?")[1]);
    const failOrderId = urlParams.get("orderId");
    
    // Verify with failure
    const res = await axios.post(`${API_URL}/api/order/verify`, {
      orderId: failOrderId,
      success: "false",
    });

    console.log("📩 Response data:", res.data);

    if (res.data.success !== false) throw new Error("Expected failure but got success");
    if (!res.data.message.includes("failed")) {
      throw new Error("Expected 'failed' message");
    }
    
    // Check if order is deleted
    const order = await orderModel.findById(failOrderId);
    if (order !== null) {
      throw new Error("Order should be deleted on payment failure");
    }
    
    console.log("✅ Verify order failure handled correctly");
    
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
    { name: "Place Order", fn: testPlaceOrder },
    { name: "Verify Order Success", fn: testVerifyOrderSuccess },
    { name: "Get User Orders", fn: testUserOrder },
    { name: "List All Orders", fn: testListOrders },
    { name: "Update Order Status", fn: testUpdateStatus },
    { name: "Verify Order Failure", fn: testVerifyOrderFailure },
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
    console.log("📊 Order Test Suite Summary:");
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Total:  ${tests.length}`);
    console.log("=".repeat(50));

    if (failed > 0) {
      throw new Error(`${failed} order test(s) failed`);
    }
  } catch (error) {
    console.error("\n❌ Test suite failed:", error.message);
    throw error;
  } finally {
    await cleanup();
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then(() => process.exit(0)).catch(() => process.exit(1));
}
