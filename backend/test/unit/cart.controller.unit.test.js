// Unit tests for cart controller functions
// Tests individual functions with mock objects (no external dependencies)

// Mock request and response objects
function createMockReq(body = {}) {
  return { body };
}

function createMockRes() {
  const res = {
    data: null,
    json: function(data) {
      this.data = data;
      return this;
    }
  };
  return res;
}

// Mock data storage
const mockUsers = [];

// Mock userModel
const mockUserModel = {
  async findById(id) {
    return mockUsers.find(u => u._id === id);
  },
  async findByIdAndUpdate(id, update) {
    const user = mockUsers.find(u => u._id === id);
    if (user && update.cartData) {
      user.cartData = update.cartData;
    }
    return user;
  }
};

// Simplified addToCart controller function for testing
async function addToCartLogic(req, res) {
  try {
    let userData = await mockUserModel.findById(req.body.userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found." });
    }
    
    let cartData = userData.cartData;
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }
    await mockUserModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Added To Cart." });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error adding to cart. Please try again later.",
    });
  }
}

// Simplified removeFromCart controller function for testing
async function removeFromCartLogic(req, res) {
  try {
    let userData = await mockUserModel.findById(req.body.userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found." });
    }
    
    let cartData = userData.cartData;
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;
    } else {
      return res.json({ success: false, message: "Cart empty." });
    }

    await mockUserModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Removed from Cart." });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error removing from cart. Please try again later.",
    });
  }
}

// Simplified getCartData controller function for testing
async function getCartDataLogic(req, res) {
  try {
    let userData = await mockUserModel.findById(req.body.userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found." });
    }
    
    let cartData = userData.cartData;
    res.json({ success: true, cartData });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error retreiving cart. Please try again later.",
    });
  }
}

// Unit Tests
export async function testAddToCartSuccess() {
  console.log("\n🧪 Unit Test: Add to Cart - Success (New Item)");
  
  // Setup mock user with empty cart
  const testUser = {
    _id: 'user_123',
    name: 'Test User',
    cartData: {}
  };
  mockUsers.push(testUser);
  
  const req = createMockReq({
    userId: 'user_123',
    itemId: 'item_456'
  });
  
  const res = createMockRes();
  await addToCartLogic(req, res);
  
  if (res.data.success && res.data.message === "Added To Cart.") {
    console.log("✅ PASS: Item added to cart successfully");
    return true;
  } else {
    console.log("❌ FAIL: Expected success: true");
    return false;
  }
}

export async function testAddToCartIncrement() {
  console.log("\n🧪 Unit Test: Add to Cart - Increment Existing Item");
  
  // User already has item in cart
  const testUser = mockUsers.find(u => u._id === 'user_123');
  testUser.cartData = { 'item_456': 1 };
  
  const req = createMockReq({
    userId: 'user_123',
    itemId: 'item_456'
  });
  
  const res = createMockRes();
  await addToCartLogic(req, res);
  
  if (res.data.success && testUser.cartData['item_456'] === 2) {
    console.log("✅ PASS: Item quantity incremented");
    return true;
  } else {
    console.log("❌ FAIL: Expected item quantity to be 2");
    return false;
  }
}

export async function testRemoveFromCartSuccess() {
  console.log("\n🧪 Unit Test: Remove from Cart - Success");
  
  // User has item in cart with quantity 2
  const testUser = mockUsers.find(u => u._id === 'user_123');
  testUser.cartData = { 'item_456': 2 };
  
  const req = createMockReq({
    userId: 'user_123',
    itemId: 'item_456'
  });
  
  const res = createMockRes();
  await removeFromCartLogic(req, res);
  
  if (res.data.success && testUser.cartData['item_456'] === 1) {
    console.log("✅ PASS: Item removed from cart successfully");
    return true;
  } else {
    console.log("❌ FAIL: Expected item quantity to be 1");
    return false;
  }
}

export async function testRemoveFromCartEmpty() {
  console.log("\n🧪 Unit Test: Remove from Cart - Cart Empty");
  
  // User has empty cart
  const testUser = mockUsers.find(u => u._id === 'user_123');
  testUser.cartData = { 'item_456': 0 };
  
  const req = createMockReq({
    userId: 'user_123',
    itemId: 'item_456'
  });
  
  const res = createMockRes();
  await removeFromCartLogic(req, res);
  
  if (!res.data.success && res.data.message === "Cart empty.") {
    console.log("✅ PASS: Empty cart handled correctly");
    return true;
  } else {
    console.log("❌ FAIL: Expected 'Cart empty' message");
    return false;
  }
}

export async function testGetCartDataSuccess() {
  console.log("\n🧪 Unit Test: Get Cart Data - Success");
  
  // User has items in cart
  const testUser = mockUsers.find(u => u._id === 'user_123');
  testUser.cartData = { 'item_456': 3, 'item_789': 1 };
  
  const req = createMockReq({
    userId: 'user_123'
  });
  
  const res = createMockRes();
  await getCartDataLogic(req, res);
  
  if (res.data.success && res.data.cartData['item_456'] === 3) {
    console.log("✅ PASS: Cart data retrieved successfully");
    return true;
  } else {
    console.log("❌ FAIL: Expected cart data with correct items");
    return false;
  }
}

export async function testGetCartDataUserNotFound() {
  console.log("\n🧪 Unit Test: Get Cart Data - User Not Found");
  
  const req = createMockReq({
    userId: 'nonexistent_user'
  });
  
  const res = createMockRes();
  await getCartDataLogic(req, res);
  
  if (!res.data.success) {
    console.log("✅ PASS: User not found handled correctly");
    return true;
  } else {
    console.log("❌ FAIL: Expected failure for nonexistent user");
    return false;
  }
}

// Run all unit tests
export async function runCartControllerUnitTests() {
  console.log("\n========================================");
  console.log("🧪 CART CONTROLLER UNIT TESTS");
  console.log("========================================");

  const results = [];
  
  results.push(await testAddToCartSuccess());
  results.push(await testAddToCartIncrement());
  results.push(await testRemoveFromCartSuccess());
  results.push(await testRemoveFromCartEmpty());
  results.push(await testGetCartDataSuccess());
  results.push(await testGetCartDataUserNotFound());

  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;
  const total = results.length;

  console.log("\n========================================");
  console.log("📊 CART CONTROLLER UNIT TEST SUMMARY");
  console.log("========================================");
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log("========================================\n");

  return { passed, failed, total };
}
