// Unit tests for restaurant-specific order filtering functionality
// Tests restaurantIds extraction, restaurantStatus tracking, and order filtering

// Mock request and response objects
function createMockReq(body = {}, params = {}, restaurantId = null) {
  return {
    body,
    params,
    restaurantId, // Set by authRestaurant middleware
  };
}

function createMockRes() {
  const res = {
    data: null,
    statusCode: 200,
    json: function(data) {
      this.data = data;
      return this;
    },
    status: function(code) {
      this.statusCode = code;
      return this;
    }
  };
  return res;
}

// Mock database models
const mockOrders = [];
const mockRestaurants = [
  { _id: 'rest1', name: 'Restaurant 1' },
  { _id: 'rest2', name: 'Restaurant 2' },
  { _id: 'rest3', name: 'Restaurant 3' },
];

// Helper function to extract unique restaurantIds
function extractRestaurantIds(items) {
  return [...new Set(
    items
      .map(item => item.restaurantId)
      .filter(id => id)
  )];
}

// Helper function to initialize restaurantStatus Map
function initializeRestaurantStatus(restaurantIds) {
  const restaurantStatus = new Map();
  restaurantIds.forEach(id => {
    restaurantStatus.set(id.toString(), "Food Processing");
  });
  return restaurantStatus;
}

// Simplified placeOrder logic with restaurantIds extraction
async function placeOrderWithRestaurants(req, res) {
  try {
    // Extract unique restaurantIds from order items
    const restaurantIds = extractRestaurantIds(req.body.items);

    // Initialize restaurantStatus for each restaurant
    const restaurantStatus = initializeRestaurantStatus(restaurantIds);

    const newOrder = {
      _id: 'order_' + Date.now(),
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      cod: false,
      payment: false,
      status: "Food Processing",
      restaurantIds: restaurantIds,
      restaurantStatus: restaurantStatus,
    };

    mockOrders.push(newOrder);

    return res.json({
      success: true,
      session_url: `http://checkout?orderId=${newOrder._id}`,
      message: "Your order has been placed.",
    });
  } catch (error) {
    return res.json({ 
      success: false, 
      message: "Error placing order. Please try again later." 
    });
  }
}

// Get orders for specific restaurant
async function getRestaurantOrders(req, res) {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }
    
    // Filter orders that contain this restaurant's items
    const orders = mockOrders.filter(order => 
      order.restaurantIds && order.restaurantIds.includes(restaurantId)
    );

    res.json({ 
      success: true, 
      data: orders,
      message: "Restaurant orders fetched successfully." 
    });
  } catch (error) {
    res.json({ success: false, message: "Error fetching restaurant orders." });
  }
}

// Update order status for specific restaurant
async function updateRestaurantOrderStatus(req, res) {
  try {
    const restaurantId = req.restaurantId;
    const { orderId, status } = req.body;

    const order = mockOrders.find(o => o._id === orderId);
    
    if (!order) {
      return res.json({ success: false, message: "Order not found." });
    }

    // Verify this restaurant is part of the order
    if (!order.restaurantIds.includes(restaurantId)) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to update this order." 
      });
    }

    // Update status for this specific restaurant
    if (!order.restaurantStatus) {
      order.restaurantStatus = new Map();
    }
    order.restaurantStatus.set(restaurantId.toString(), status);

    // Aggregate statuses to determine main order status
    const allStatuses = Array.from(order.restaurantStatus.values());
    if (allStatuses.every(s => s === "Delivered" || s === "Out for Delivery")) {
      order.status = "Delivered";
    } else if (allStatuses.some(s => s === "Out for Delivery")) {
      order.status = "Out for Delivery";
    } else if (allStatuses.some(s => s === "Ready for Pickup")) {
      order.status = "Ready for Pickup";
    } else if (allStatuses.some(s => s === "Preparing")) {
      order.status = "Preparing";
    }

    res.json({ success: true, message: "Order status updated." });
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to update order. Try again later.",
    });
  }
}

// Unit Tests

export async function testExtractRestaurantIds() {
  console.log("\n🧪 Unit Test: Extract Restaurant IDs");
  
  const items = [
    { _id: "item1", name: "Pizza", restaurantId: "rest1" },
    { _id: "item2", name: "Pasta", restaurantId: "rest1" },
    { _id: "item3", name: "Burger", restaurantId: "rest2" },
    { _id: "item4", name: "Salad", restaurantId: "rest2" },
    { _id: "item5", name: "Sushi", restaurantId: "rest3" },
  ];
  
  const restaurantIds = extractRestaurantIds(items);
  
  if (restaurantIds.length !== 3) {
    throw new Error(`Expected 3 unique restaurants, got ${restaurantIds.length}`);
  }
  
  if (!restaurantIds.includes("rest1") || !restaurantIds.includes("rest2") || !restaurantIds.includes("rest3")) {
    throw new Error("Missing expected restaurant IDs");
  }
  
  console.log("✅ Restaurant IDs extracted correctly:", restaurantIds);
}

export async function testInitializeRestaurantStatus() {
  console.log("\n🧪 Unit Test: Initialize Restaurant Status Map");
  
  const restaurantIds = ["rest1", "rest2", "rest3"];
  const statusMap = initializeRestaurantStatus(restaurantIds);
  
  if (statusMap.size !== 3) {
    throw new Error(`Expected 3 entries in status map, got ${statusMap.size}`);
  }
  
  restaurantIds.forEach(id => {
    if (statusMap.get(id) !== "Food Processing") {
      throw new Error(`Expected "Food Processing" for ${id}, got ${statusMap.get(id)}`);
    }
  });
  
  console.log("✅ Restaurant status map initialized correctly");
}

export async function testPlaceOrderWithMultipleRestaurants() {
  console.log("\n🧪 Unit Test: Place Order with Multiple Restaurants");
  
  const req = createMockReq({
    userId: "user123",
    items: [
      { _id: "item1", name: "Pizza", price: 100, quantity: 1, restaurantId: "rest1" },
      { _id: "item2", name: "Burger", price: 80, quantity: 2, restaurantId: "rest2" },
      { _id: "item3", name: "Sushi", price: 120, quantity: 1, restaurantId: "rest3" },
    ],
    amount: 380,
    address: { name: "Test User", email: "test@test.com", street: "123 St" }
  });
  
  const res = createMockRes();
  
  // Clear mock orders
  mockOrders.length = 0;
  
  await placeOrderWithRestaurants(req, res);
  
  if (!res.data.success) throw new Error("Expected success");
  if (mockOrders.length !== 1) throw new Error("Order not created");
  
  const order = mockOrders[0];
  
  if (!order.restaurantIds || order.restaurantIds.length !== 3) {
    throw new Error(`Expected 3 restaurantIds, got ${order.restaurantIds?.length}`);
  }
  
  if (!order.restaurantStatus || order.restaurantStatus.size !== 3) {
    throw new Error(`Expected 3 restaurant statuses, got ${order.restaurantStatus?.size}`);
  }
  
  console.log("✅ Multi-restaurant order created successfully");
  console.log("   Restaurant IDs:", order.restaurantIds);
  console.log("   Restaurant Statuses:", Object.fromEntries(order.restaurantStatus));
}

export async function testGetRestaurantOrdersFiltering() {
  console.log("\n🧪 Unit Test: Get Restaurant Orders (Filtering)");
  
  // Clear and setup test data
  mockOrders.length = 0;
  
  // Create orders for different restaurants
  mockOrders.push({
    _id: "order1",
    userId: "user1",
    restaurantIds: ["rest1", "rest2"],
    items: [
      { name: "Pizza", restaurantId: "rest1" },
      { name: "Burger", restaurantId: "rest2" },
    ],
  });
  
  mockOrders.push({
    _id: "order2",
    userId: "user2",
    restaurantIds: ["rest2", "rest3"],
    items: [
      { name: "Pasta", restaurantId: "rest2" },
      { name: "Sushi", restaurantId: "rest3" },
    ],
  });
  
  mockOrders.push({
    _id: "order3",
    userId: "user3",
    restaurantIds: ["rest1"],
    items: [
      { name: "Salad", restaurantId: "rest1" },
    ],
  });
  
  // Test for rest1
  const req1 = createMockReq({}, {}, "rest1");
  const res1 = createMockRes();
  await getRestaurantOrders(req1, res1);
  
  if (!res1.data.success) throw new Error("Expected success for rest1");
  if (res1.data.data.length !== 2) {
    throw new Error(`Expected 2 orders for rest1, got ${res1.data.data.length}`);
  }
  
  // Test for rest2
  const req2 = createMockReq({}, {}, "rest2");
  const res2 = createMockRes();
  await getRestaurantOrders(req2, res2);
  
  if (!res2.data.success) throw new Error("Expected success for rest2");
  if (res2.data.data.length !== 2) {
    throw new Error(`Expected 2 orders for rest2, got ${res2.data.data.length}`);
  }
  
  // Test for rest3
  const req3 = createMockReq({}, {}, "rest3");
  const res3 = createMockRes();
  await getRestaurantOrders(req3, res3);
  
  if (!res3.data.success) throw new Error("Expected success for rest3");
  if (res3.data.data.length !== 1) {
    throw new Error(`Expected 1 order for rest3, got ${res3.data.data.length}`);
  }
  
  console.log("✅ Restaurant order filtering works correctly");
  console.log("   rest1 orders:", res1.data.data.length);
  console.log("   rest2 orders:", res2.data.data.length);
  console.log("   rest3 orders:", res3.data.data.length);
}

export async function testUpdateRestaurantOrderStatusPermission() {
  console.log("\n🧪 Unit Test: Update Order Status - Permission Check");
  
  // Setup test order
  mockOrders.length = 0;
  
  const testOrder = {
    _id: "order_test",
    userId: "user1",
    restaurantIds: ["rest1", "rest2"],
    restaurantStatus: new Map([
      ["rest1", "Food Processing"],
      ["rest2", "Food Processing"],
    ]),
    status: "Food Processing",
  };
  
  mockOrders.push(testOrder);
  
  // Test: Restaurant that IS part of the order (should succeed)
  const req1 = createMockReq(
    { orderId: "order_test", status: "Preparing" },
    {},
    "rest1"
  );
  const res1 = createMockRes();
  await updateRestaurantOrderStatus(req1, res1);
  
  if (!res1.data.success) {
    throw new Error("Expected success for authorized restaurant");
  }
  
  if (testOrder.restaurantStatus.get("rest1") !== "Preparing") {
    throw new Error("Status not updated correctly");
  }
  
  // Test: Restaurant that is NOT part of the order (should fail)
  const req2 = createMockReq(
    { orderId: "order_test", status: "Preparing" },
    {},
    "rest3"
  );
  const res2 = createMockRes();
  await updateRestaurantOrderStatus(req2, res2);
  
  if (res2.data.success !== false) {
    throw new Error("Expected failure for unauthorized restaurant");
  }
  
  if (res2.statusCode !== 403) {
    throw new Error(`Expected 403 status code, got ${res2.statusCode}`);
  }
  
  console.log("✅ Permission check works correctly");
}

export async function testStatusAggregation() {
  console.log("\n🧪 Unit Test: Order Status Aggregation");
  
  mockOrders.length = 0;
  
  const testOrder = {
    _id: "order_agg",
    userId: "user1",
    restaurantIds: ["rest1", "rest2", "rest3"],
    restaurantStatus: new Map([
      ["rest1", "Food Processing"],
      ["rest2", "Food Processing"],
      ["rest3", "Food Processing"],
    ]),
    status: "Food Processing",
  };
  
  mockOrders.push(testOrder);
  
  // Scenario 1: One restaurant starts preparing
  const req1 = createMockReq({ orderId: "order_agg", status: "Preparing" }, {}, "rest1");
  const res1 = createMockRes();
  await updateRestaurantOrderStatus(req1, res1);
  
  if (testOrder.status !== "Preparing") {
    throw new Error(`Expected main status "Preparing", got "${testOrder.status}"`);
  }
  
  // Scenario 2: All restaurants are preparing
  const req2 = createMockReq({ orderId: "order_agg", status: "Preparing" }, {}, "rest2");
  const res2 = createMockRes();
  await updateRestaurantOrderStatus(req2, res2);
  
  const req3 = createMockReq({ orderId: "order_agg", status: "Preparing" }, {}, "rest3");
  const res3 = createMockRes();
  await updateRestaurantOrderStatus(req3, res3);
  
  if (testOrder.status !== "Preparing") {
    throw new Error(`Expected main status "Preparing", got "${testOrder.status}"`);
  }
  
  // Scenario 3: One restaurant marks ready
  const req4 = createMockReq({ orderId: "order_agg", status: "Ready for Pickup" }, {}, "rest1");
  const res4 = createMockRes();
  await updateRestaurantOrderStatus(req4, res4);
  
  if (testOrder.status !== "Ready for Pickup") {
    throw new Error(`Expected main status "Ready for Pickup", got "${testOrder.status}"`);
  }
  
  // Scenario 4: All restaurants ready, one dispatches
  const req5 = createMockReq({ orderId: "order_agg", status: "Ready for Pickup" }, {}, "rest2");
  const res5 = createMockRes();
  await updateRestaurantOrderStatus(req5, res5);
  
  const req6 = createMockReq({ orderId: "order_agg", status: "Ready for Pickup" }, {}, "rest3");
  const res6 = createMockRes();
  await updateRestaurantOrderStatus(req6, res6);
  
  const req7 = createMockReq({ orderId: "order_agg", status: "Out for Delivery" }, {}, "rest1");
  const res7 = createMockRes();
  await updateRestaurantOrderStatus(req7, res7);
  
  if (testOrder.status !== "Out for Delivery") {
    throw new Error(`Expected main status "Out for Delivery", got "${testOrder.status}"`);
  }
  
  // Scenario 5: All delivered
  const req8 = createMockReq({ orderId: "order_agg", status: "Out for Delivery" }, {}, "rest2");
  const res8 = createMockRes();
  await updateRestaurantOrderStatus(req8, res8);
  
  const req9 = createMockReq({ orderId: "order_agg", status: "Out for Delivery" }, {}, "rest3");
  const res9 = createMockRes();
  await updateRestaurantOrderStatus(req9, res9);
  
  if (testOrder.status !== "Delivered") {
    throw new Error(`Expected main status "Delivered", got "${testOrder.status}"`);
  }
  
  console.log("✅ Status aggregation works correctly through all stages");
}

export async function testUnauthorizedAccess() {
  console.log("\n🧪 Unit Test: Unauthorized Access (No Restaurant ID)");
  
  const req = createMockReq({}, {}, null); // No restaurantId
  const res = createMockRes();
  
  await getRestaurantOrders(req, res);
  
  if (res.statusCode !== 401) {
    throw new Error(`Expected 401 status, got ${res.statusCode}`);
  }
  
  if (res.data.success !== false) {
    throw new Error("Expected failure for unauthorized access");
  }
  
  console.log("✅ Unauthorized access blocked correctly");
}

// Main runner for unit tests
export async function runUnitTests() {
  let passed = 0;
  let failed = 0;
  
  const tests = [
    { name: "Extract Restaurant IDs", fn: testExtractRestaurantIds },
    { name: "Initialize Restaurant Status", fn: testInitializeRestaurantStatus },
    { name: "Place Order with Multiple Restaurants", fn: testPlaceOrderWithMultipleRestaurants },
    { name: "Get Restaurant Orders Filtering", fn: testGetRestaurantOrdersFiltering },
    { name: "Update Order Status Permission", fn: testUpdateRestaurantOrderStatusPermission },
    { name: "Order Status Aggregation", fn: testStatusAggregation },
    { name: "Unauthorized Access", fn: testUnauthorizedAccess },
  ];
  
  console.log("\n" + "=".repeat(60));
  console.log("🔬 Running Restaurant Order Filtering Unit Tests");
  console.log("   (Isolated, No External Dependencies)");
  console.log("=".repeat(60));
  
  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error.message);
      failed++;
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 Restaurant Order Unit Test Summary:");
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total:  ${tests.length}`);
  console.log("=".repeat(60));
  
  if (failed > 0) {
    throw new Error(`${failed} unit test(s) failed`);
  }
}

// Run tests if this file is executed directly
const isMainModule = process.argv[1] && process.argv[1].includes('restaurant-order.controller.unit.test.js');

if (isMainModule) {
  runUnitTests()
    .then(() => {
      console.log("\n✅ All restaurant order unit tests completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Restaurant order unit tests failed:", error.message);
      process.exit(1);
    });
}
