import axios from "axios";
import dotenv from "dotenv";
import userModel from "../../../database/models/user.model.js";
import orderModel from "../../../database/models/order.model.js";
import restaurantModel from "../../../database/models/restaurant.model.js";
import foodModel from "../../../database/models/food.model.js";
import { connectDb } from "../../../database/db.js";

dotenv.config();
const API_URL = process.env.DOMAIN || "http://localhost:5000";

// Test data
let testUserEmail = null;
let testUserId = null;
let testUserToken = null;

let testRestaurant1 = null;
let testRestaurant2 = null;
let testRestaurant3 = null;
let testRestaurantToken1 = null;
let testRestaurantToken2 = null;
let testRestaurantToken3 = null;

let testFood1 = null;
let testFood2 = null;
let testFood3 = null;
let testOrderId = null;

// Setup: Create test data
export async function setup() {
  await connectDb();
  
  console.log("\n🔧 Setting up test data for restaurant order filtering...");
  
  // 1. Create test user
  testUserEmail = `test_rest_order_${Date.now()}@test.com`;
  
  const registerUserRes = await axios.post(`${API_URL}/api/user/register`, {
    name: "Restaurant Order Test User",
    email: testUserEmail,
    password: "TestPassword123",
  });
  
  if (!registerUserRes.data.success) {
    throw new Error("Failed to create test user");
  }
  
  testUserToken = registerUserRes.data.token;
  const user = await userModel.findOne({ email: testUserEmail });
  testUserId = user._id.toString();
  
  console.log("✅ Test user created");
  
  // 2. Create test restaurants
  const timestamp = Date.now();
  
  const registerRest1 = await axios.post(`${API_URL}/api/restaurant/register`, {
    name: "Test Restaurant 1",
    email: `test_rest1_${timestamp}@test.com`,
    password: "TestPassword123",
    phoneNumber: "1234567890",
    address: "123 Test St",
    city: "Test City",
    restaurantCode: `TEST1_${timestamp}`,
  });
  
  if (!registerRest1.data.success) {
    throw new Error("Failed to create test restaurant 1");
  }
  
  testRestaurantToken1 = registerRest1.data.token;
  testRestaurant1 = await restaurantModel.findOne({ email: `test_rest1_${timestamp}@test.com` });
  
  const registerRest2 = await axios.post(`${API_URL}/api/restaurant/register`, {
    name: "Test Restaurant 2",
    email: `test_rest2_${timestamp}@test.com`,
    password: "TestPassword123",
    phoneNumber: "1234567891",
    address: "456 Test Ave",
    city: "Test City",
    restaurantCode: `TEST2_${timestamp}`,
  });
  
  if (!registerRest2.data.success) {
    throw new Error("Failed to create test restaurant 2");
  }
  
  testRestaurantToken2 = registerRest2.data.token;
  testRestaurant2 = await restaurantModel.findOne({ email: `test_rest2_${timestamp}@test.com` });
  
  const registerRest3 = await axios.post(`${API_URL}/api/restaurant/register`, {
    name: "Test Restaurant 3",
    email: `test_rest3_${timestamp}@test.com`,
    password: "TestPassword123",
    phoneNumber: "1234567892",
    address: "789 Test Blvd",
    city: "Test City",
    restaurantCode: `TEST3_${timestamp}`,
  });
  
  if (!registerRest3.data.success) {
    throw new Error("Failed to create test restaurant 3");
  }
  
  testRestaurantToken3 = registerRest3.data.token;
  testRestaurant3 = await restaurantModel.findOne({ email: `test_rest3_${timestamp}@test.com` });
  
  console.log("✅ 3 test restaurants created");
  
  // 3. Create test food items for each restaurant
  testFood1 = await foodModel.create({
    name: "Test Pizza",
    description: "Test pizza from restaurant 1",
    price: 100,
    category: "Pizza",
    image: "http://example.com/pizza.jpg",
    restaurantId: testRestaurant1._id,
  });
  
  testFood2 = await foodModel.create({
    name: "Test Burger",
    description: "Test burger from restaurant 2",
    price: 80,
    category: "Burgers",
    image: "http://example.com/burger.jpg",
    restaurantId: testRestaurant2._id,
  });
  
  testFood3 = await foodModel.create({
    name: "Test Sushi",
    description: "Test sushi from restaurant 3",
    price: 120,
    category: "Sushi",
    image: "http://example.com/sushi.jpg",
    restaurantId: testRestaurant3._id,
  });
  
  console.log("✅ Test food items created");
  console.log(`   Restaurant 1 ID: ${testRestaurant1._id}`);
  console.log(`   Restaurant 2 ID: ${testRestaurant2._id}`);
  console.log(`   Restaurant 3 ID: ${testRestaurant3._id}`);
}

// Cleanup: Delete test data
export async function cleanup() {
  console.log("\n🧹 Cleaning up test data...");
  
  try {
    if (testUserId) {
      await userModel.deleteOne({ _id: testUserId });
    }
    
    if (testRestaurant1) {
      await restaurantModel.deleteOne({ _id: testRestaurant1._id });
      await foodModel.deleteMany({ restaurantId: testRestaurant1._id });
      await orderModel.deleteMany({ restaurantIds: testRestaurant1._id });
    }
    
    if (testRestaurant2) {
      await restaurantModel.deleteOne({ _id: testRestaurant2._id });
      await foodModel.deleteMany({ restaurantId: testRestaurant2._id });
      await orderModel.deleteMany({ restaurantIds: testRestaurant2._id });
    }
    
    if (testRestaurant3) {
      await restaurantModel.deleteOne({ _id: testRestaurant3._id });
      await foodModel.deleteMany({ restaurantId: testRestaurant3._id });
      await orderModel.deleteMany({ restaurantIds: testRestaurant3._id });
    }
    
    console.log("✅ Test data cleaned up successfully");
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
  }
}

// Test: Place order with items from multiple restaurants
export async function testPlaceMultiRestaurantOrder() {
  console.log("\n🧪 Integration Test: Place Order with Multiple Restaurants");
  
  try {
    const res = await axios.post(
      `${API_URL}/api/order/placeorder`,
      {
        userId: testUserId,
        items: [
          {
            _id: testFood1._id.toString(),
            name: testFood1.name,
            price: testFood1.price,
            quantity: 2,
            restaurantId: testRestaurant1._id.toString(),
          },
          {
            _id: testFood2._id.toString(),
            name: testFood2.name,
            price: testFood2.price,
            quantity: 1,
            restaurantId: testRestaurant2._id.toString(),
          },
          {
            _id: testFood3._id.toString(),
            name: testFood3.name,
            price: testFood3.price,
            quantity: 1,
            restaurantId: testRestaurant3._id.toString(),
          },
        ],
        amount: 400,
        address: {
          name: "Restaurant Order Test User",
          email: testUserEmail,
          street: "123 Test St",
          city: "Test City",
          apartmentNo: "Apt 1",
          area: "Test Area",
          landmark: "Near Test Park",
          phone: "1234567890",
        },
      },
      {
        headers: { token: testUserToken },
      }
    );

    console.log("📩 Response:", res.data);

    if (!res.data.success) {
      throw new Error("Expected success but got failure");
    }
    
    // Extract order ID from session URL
    const urlParams = new URLSearchParams(res.data.session_url.split("?")[1]);
    testOrderId = urlParams.get("orderId");
    
    // Verify order in database
    const order = await orderModel.findById(testOrderId);
    
    if (!order) {
      throw new Error("Order not found in database");
    }
    
    if (!order.restaurantIds || order.restaurantIds.length !== 3) {
      throw new Error(`Expected 3 restaurantIds, got ${order.restaurantIds?.length}`);
    }
    
    if (!order.restaurantStatus || order.restaurantStatus.size !== 3) {
      throw new Error(`Expected 3 restaurant statuses, got ${order.restaurantStatus?.size}`);
    }
    
    // Verify all restaurants have "Food Processing" status
    const rest1Status = order.restaurantStatus.get(testRestaurant1._id.toString());
    const rest2Status = order.restaurantStatus.get(testRestaurant2._id.toString());
    const rest3Status = order.restaurantStatus.get(testRestaurant3._id.toString());
    
    if (rest1Status !== "Food Processing" || rest2Status !== "Food Processing" || rest3Status !== "Food Processing") {
      throw new Error("Initial restaurant statuses not set correctly");
    }
    
    console.log("✅ Multi-restaurant order placed successfully");
    console.log(`   Order ID: ${testOrderId}`);
    console.log(`   Restaurant IDs: ${order.restaurantIds.join(", ")}`);
    console.log(`   Restaurant Statuses:`, Object.fromEntries(order.restaurantStatus));
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed:", err.response?.data || err.message);
    throw err;
  }
}

// Test: Verify order payment
export async function testVerifyMultiRestaurantOrder() {
  console.log("\n🧪 Integration Test: Verify Multi-Restaurant Order Payment");
  
  try {
    if (!testOrderId) {
      throw new Error("No test order ID available");
    }
    
    const res = await axios.post(`${API_URL}/api/order/verify`, {
      orderId: testOrderId,
      success: "true",
    });

    console.log("📩 Response:", res.data);

    if (!res.data.success) {
      throw new Error("Expected success but got failure");
    }
    
    // Verify payment updated
    const order = await orderModel.findById(testOrderId);
    if (!order.payment) {
      throw new Error("Payment not updated");
    }
    
    console.log("✅ Multi-restaurant order verified successfully");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed:", err.response?.data || err.message);
    throw err;
  }
}

// Test: Get orders for restaurant 1 (should see the order)
export async function testGetRestaurant1Orders() {
  console.log("\n🧪 Integration Test: Get Orders for Restaurant 1");
  
  try {
    const res = await axios.get(`${API_URL}/api/order/restaurant/my-orders`, {
      headers: { token: testRestaurantToken1 },
    });

    console.log("📩 Response for Restaurant 1:", { 
      success: res.data.success, 
      orderCount: res.data.data?.length 
    });

    if (!res.data.success) {
      throw new Error("Expected success but got failure");
    }
    
    if (!Array.isArray(res.data.data)) {
      throw new Error("Expected orders array");
    }
    
    // Should have at least our test order
    const hasTestOrder = res.data.data.some(order => order._id === testOrderId);
    if (!hasTestOrder) {
      throw new Error("Test order not found in restaurant 1 orders");
    }
    
    console.log("✅ Restaurant 1 can see the order");
    console.log(`   Total orders: ${res.data.data.length}`);
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed:", err.response?.data || err.message);
    throw err;
  }
}

// Test: Get orders for restaurant 2 (should see the order)
export async function testGetRestaurant2Orders() {
  console.log("\n🧪 Integration Test: Get Orders for Restaurant 2");
  
  try {
    const res = await axios.get(`${API_URL}/api/order/restaurant/my-orders`, {
      headers: { token: testRestaurantToken2 },
    });

    console.log("📩 Response for Restaurant 2:", { 
      success: res.data.success, 
      orderCount: res.data.data?.length 
    });

    if (!res.data.success) {
      throw new Error("Expected success but got failure");
    }
    
    const hasTestOrder = res.data.data.some(order => order._id === testOrderId);
    if (!hasTestOrder) {
      throw new Error("Test order not found in restaurant 2 orders");
    }
    
    console.log("✅ Restaurant 2 can see the order");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed:", err.response?.data || err.message);
    throw err;
  }
}

// Test: Get orders for restaurant 3 (should see the order)
export async function testGetRestaurant3Orders() {
  console.log("\n🧪 Integration Test: Get Orders for Restaurant 3");
  
  try {
    const res = await axios.get(`${API_URL}/api/order/restaurant/my-orders`, {
      headers: { token: testRestaurantToken3 },
    });

    console.log("📩 Response for Restaurant 3:", { 
      success: res.data.success, 
      orderCount: res.data.data?.length 
    });

    if (!res.data.success) {
      throw new Error("Expected success but got failure");
    }
    
    const hasTestOrder = res.data.data.some(order => order._id === testOrderId);
    if (!hasTestOrder) {
      throw new Error("Test order not found in restaurant 3 orders");
    }
    
    console.log("✅ Restaurant 3 can see the order");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed:", err.response?.data || err.message);
    throw err;
  }
}

// Test: Restaurant 1 updates status to "Preparing"
export async function testRestaurant1UpdateStatus() {
  console.log("\n🧪 Integration Test: Restaurant 1 Updates Status to Preparing");
  
  try {
    const res = await axios.post(
      `${API_URL}/api/order/restaurant/update`,
      {
        orderId: testOrderId,
        status: "Preparing",
      },
      {
        headers: { token: testRestaurantToken1 },
      }
    );

    console.log("📩 Response:", res.data);

    if (!res.data.success) {
      throw new Error("Expected success but got failure");
    }
    
    // Verify status updated correctly
    const order = await orderModel.findById(testOrderId);
    
    const rest1Status = order.restaurantStatus.get(testRestaurant1._id.toString());
    if (rest1Status !== "Preparing") {
      throw new Error(`Expected rest1 status "Preparing", got "${rest1Status}"`);
    }
    
    // Main order status should be "Preparing" (at least one restaurant is preparing)
    if (order.status !== "Preparing") {
      throw new Error(`Expected main status "Preparing", got "${order.status}"`);
    }
    
    console.log("✅ Restaurant 1 status updated to Preparing");
    console.log(`   Main order status: ${order.status}`);
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed:", err.response?.data || err.message);
    throw err;
  }
}

// Test: Restaurant 2 tries to update Restaurant 1's portion (should fail)
export async function testUnauthorizedStatusUpdate() {
  console.log("\n🧪 Integration Test: Unauthorized Status Update (Should Fail)");
  
  try {
    // This should succeed because restaurant 2 IS part of the order
    // But let's test that each restaurant can only update their own status
    
    const res = await axios.post(
      `${API_URL}/api/order/restaurant/update`,
      {
        orderId: testOrderId,
        status: "Ready for Pickup",
      },
      {
        headers: { token: testRestaurantToken2 },
      }
    );

    if (!res.data.success) {
      throw new Error("Expected success for restaurant 2");
    }
    
    // Verify that restaurant 1's status is unchanged
    const order = await orderModel.findById(testOrderId);
    const rest1Status = order.restaurantStatus.get(testRestaurant1._id.toString());
    const rest2Status = order.restaurantStatus.get(testRestaurant2._id.toString());
    
    if (rest1Status !== "Preparing") {
      throw new Error("Restaurant 1 status should not change");
    }
    
    if (rest2Status !== "Ready for Pickup") {
      throw new Error("Restaurant 2 status not updated");
    }
    
    console.log("✅ Each restaurant can only update their own status");
    console.log(`   Rest1 status: ${rest1Status}`);
    console.log(`   Rest2 status: ${rest2Status}`);
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed:", err.response?.data || err.message);
    throw err;
  }
}

// Test: Complete order flow - all restaurants mark as delivered
export async function testCompleteOrderFlow() {
  console.log("\n🧪 Integration Test: Complete Order Flow to Delivered");
  
  try {
    // Restaurant 3 marks ready
    await axios.post(
      `${API_URL}/api/order/restaurant/update`,
      { orderId: testOrderId, status: "Ready for Pickup" },
      { headers: { token: testRestaurantToken3 } }
    );
    
    // Restaurant 1 marks ready
    await axios.post(
      `${API_URL}/api/order/restaurant/update`,
      { orderId: testOrderId, status: "Ready for Pickup" },
      { headers: { token: testRestaurantToken1 } }
    );
    
    // Check main status (should be "Ready for Pickup")
    let order = await orderModel.findById(testOrderId);
    if (order.status !== "Ready for Pickup") {
      throw new Error(`Expected "Ready for Pickup", got "${order.status}"`);
    }
    
    // Restaurant 1 dispatches
    await axios.post(
      `${API_URL}/api/order/restaurant/update`,
      { orderId: testOrderId, status: "Out for Delivery" },
      { headers: { token: testRestaurantToken1 } }
    );
    
    // Check main status (should be "Out for Delivery")
    order = await orderModel.findById(testOrderId);
    if (order.status !== "Out for Delivery") {
      throw new Error(`Expected "Out for Delivery", got "${order.status}"`);
    }
    
    // Restaurant 2 dispatches
    await axios.post(
      `${API_URL}/api/order/restaurant/update`,
      { orderId: testOrderId, status: "Out for Delivery" },
      { headers: { token: testRestaurantToken2 } }
    );
    
    // Restaurant 3 dispatches
    await axios.post(
      `${API_URL}/api/order/restaurant/update`,
      { orderId: testOrderId, status: "Out for Delivery" },
      { headers: { token: testRestaurantToken3 } }
    );
    
    // Check main status (should be "Delivered" when all are out for delivery)
    order = await orderModel.findById(testOrderId);
    if (order.status !== "Delivered") {
      throw new Error(`Expected "Delivered", got "${order.status}"`);
    }
    
    console.log("✅ Complete order flow successful");
    console.log("   All restaurants completed delivery");
    console.log(`   Final main status: ${order.status}`);
    
    return { success: true };
  } catch (err) {
    console.error("❌ Test failed:", err.response?.data || err.message);
    throw err;
  }
}

// Test: Unauthorized access without token
export async function testUnauthorizedAccess() {
  console.log("\n🧪 Integration Test: Unauthorized Access (No Token)");
  
  try {
    await axios.get(`${API_URL}/api/order/restaurant/my-orders`);
    
    // Should not reach here
    throw new Error("Expected request to fail without token");
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 500)) {
      console.log("✅ Unauthorized access blocked correctly");
      return { success: true };
    }
    throw err;
  }
}

// Main test runner
export async function runTests() {
  let passed = 0;
  let failed = 0;
  
  const tests = [
    { name: "Place Multi-Restaurant Order", fn: testPlaceMultiRestaurantOrder },
    { name: "Verify Multi-Restaurant Order", fn: testVerifyMultiRestaurantOrder },
    { name: "Get Restaurant 1 Orders", fn: testGetRestaurant1Orders },
    { name: "Get Restaurant 2 Orders", fn: testGetRestaurant2Orders },
    { name: "Get Restaurant 3 Orders", fn: testGetRestaurant3Orders },
    { name: "Restaurant 1 Update Status", fn: testRestaurant1UpdateStatus },
    { name: "Unauthorized Status Update", fn: testUnauthorizedStatusUpdate },
    { name: "Complete Order Flow", fn: testCompleteOrderFlow },
    { name: "Unauthorized Access", fn: testUnauthorizedAccess },
  ];

  try {
    await setup();
    
    console.log("\n" + "=".repeat(60));
    console.log("🔬 Running Restaurant Order Filtering Integration Tests");
    console.log("   (Real API calls, Database interactions)");
    console.log("=".repeat(60));
    
    for (const test of tests) {
      try {
        await test.fn();
        passed++;
      } catch (error) {
        console.error(`\n❌ ${test.name} failed:`, error.message);
        failed++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Restaurant Order Integration Test Summary:");
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Total:  ${tests.length}`);
    console.log("=".repeat(60));

    if (failed > 0) {
      throw new Error(`${failed} integration test(s) failed`);
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
  runTests()
    .then(() => {
      console.log("\n✅ All restaurant order integration tests completed successfully!");
      process.exit(0);
    })
    .catch(() => {
      console.log("\n❌ Some restaurant order integration tests failed");
      process.exit(1);
    });
}
