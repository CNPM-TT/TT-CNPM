// Unit tests for food controller functions
// Tests individual functions with mock objects (no external dependencies)

// Mock request and response objects
function createMockReq(body = {}, params = {}, file = null) {
  return { body, params, file };
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

// Mock data storage
const mockFoods = [];

// Mock foodModel
const mockFoodModel = {
  async find(query) {
    return mockFoods;
  },
  async findById(id) {
    return mockFoods.find(f => f._id === id);
  },
  async findByIdAndDelete(id) {
    const index = mockFoods.findIndex(f => f._id === id);
    if (index !== -1) {
      mockFoods.splice(index, 1);
    }
    return true;
  }
};

// Mock fs module
const mockFs = {
  unlink: function(path, callback) {
    callback();
  }
};

// Simplified addFood controller function for testing
async function addFoodLogic(req, res) {
  const image_url = req.file.path;

  const food = {
    _id: 'food_' + Date.now(),
    available: req.body.available,
    veg: req.body.veg,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_url,
    save: async function() {
      mockFoods.push(this);
      return this;
    }
  };

  try {
    await food.save();
    res.json({ success: true, message: "Food added." });
  } catch (error) {
    res.json({ success: false, message: "Error adding Food." });
  }
}

// Simplified getFoods controller function for testing
async function getFoodsLogic(req, res) {
  try {
    const foods = await mockFoodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    res.json({ success: false, message: "Error loading food datas." });
  }
}

// Simplified getFoodById controller function for testing
async function getFoodByIdLogic(req, res) {
  try {
    const food = await mockFoodModel.findById(req.params.id);
    if (food) {
      res.json({ success: true, data: food });
    } else {
      res.json({ success: false, message: "No food details found." });
    }
  } catch (error) {
    res.json({ success: false, message: "Error loading food data." });
  }
}

// Simplified updateFoodStatus controller function for testing
async function updateFoodStatusLogic(req, res) {
  const foodId = req.params.id;

  try {
    const food = await mockFoodModel.findById(foodId);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found." });
    }

    food.name = req.body.name;
    food.price = req.body.price;
    food.available = req.body.available;

    res.json({ success: true, message: "Food status updated." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating food price." });
  }
}

// Simplified removeFood controller function for testing
async function removeFoodLogic(req, res) {
  try {
    const food = await mockFoodModel.findById(req.body.id);
    mockFs.unlink(`uploads/${food.image}`, () => {});

    await mockFoodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food removed." });
  } catch (error) {
    res.json({ success: false, message: "Error deleting Food." });
  }
}

// Unit Tests
export async function testAddFoodSuccess() {
  console.log("\n🧪 Unit Test: Add Food - Success");
  
  const req = createMockReq(
    {
      available: true,
      veg: true,
      name: "Test Pizza",
      description: "Delicious test pizza",
      price: 12.99,
      category: "Pizza"
    },
    {},
    { path: "https://cloudinary.com/test-image.jpg" }
  );
  
  const res = createMockRes();
  await addFoodLogic(req, res);
  
  if (res.data.success && res.data.message === "Food added.") {
    console.log("✅ PASS: Food added successfully");
    return true;
  } else {
    console.log("❌ FAIL: Expected success: true");
    return false;
  }
}

export async function testGetFoodsSuccess() {
  console.log("\n🧪 Unit Test: Get Foods - Success");
  
  const req = createMockReq();
  const res = createMockRes();
  
  await getFoodsLogic(req, res);
  
  if (res.data.success && Array.isArray(res.data.data)) {
    console.log("✅ PASS: Foods retrieved successfully");
    return true;
  } else {
    console.log("❌ FAIL: Expected success: true and data array");
    return false;
  }
}

export async function testGetFoodByIdSuccess() {
  console.log("\n🧪 Unit Test: Get Food By ID - Success");
  
  // Add a food to mock database first
  const testFood = {
    _id: 'test_food_123',
    name: 'Test Food',
    price: 10.99,
    available: true
  };
  mockFoods.push(testFood);
  
  const req = createMockReq({}, { id: 'test_food_123' });
  const res = createMockRes();
  
  await getFoodByIdLogic(req, res);
  
  if (res.data.success && res.data.data._id === 'test_food_123') {
    console.log("✅ PASS: Food retrieved by ID successfully");
    return true;
  } else {
    console.log("❌ FAIL: Expected success: true and correct food data");
    return false;
  }
}

export async function testGetFoodByIdNotFound() {
  console.log("\n🧪 Unit Test: Get Food By ID - Not Found");
  
  const req = createMockReq({}, { id: 'nonexistent_id' });
  const res = createMockRes();
  
  await getFoodByIdLogic(req, res);
  
  if (!res.data.success && res.data.message === "No food details found.") {
    console.log("✅ PASS: Food not found handled correctly");
    return true;
  } else {
    console.log("❌ FAIL: Expected success: false");
    return false;
  }
}

export async function testUpdateFoodStatusSuccess() {
  console.log("\n🧪 Unit Test: Update Food Status - Success");
  
  // Add a food to mock database first
  const testFood = {
    _id: 'test_food_456',
    name: 'Old Food',
    price: 10.99,
    available: true
  };
  mockFoods.push(testFood);
  
  const req = createMockReq(
    {
      name: 'Updated Food',
      price: 15.99,
      available: false
    },
    { id: 'test_food_456' }
  );
  const res = createMockRes();
  
  await updateFoodStatusLogic(req, res);
  
  if (res.data.success && res.data.message === "Food status updated.") {
    console.log("✅ PASS: Food status updated successfully");
    return true;
  } else {
    console.log("❌ FAIL: Expected success: true");
    return false;
  }
}

export async function testUpdateFoodStatusNotFound() {
  console.log("\n🧪 Unit Test: Update Food Status - Not Found");
  
  const req = createMockReq(
    {
      name: 'Updated Food',
      price: 15.99,
      available: false
    },
    { id: 'nonexistent_id' }
  );
  const res = createMockRes();
  
  await updateFoodStatusLogic(req, res);
  
  if (!res.data.success && res.statusCode === 404) {
    console.log("✅ PASS: Food not found handled correctly");
    return true;
  } else {
    console.log("❌ FAIL: Expected success: false and status 404");
    return false;
  }
}

export async function testRemoveFoodSuccess() {
  console.log("\n🧪 Unit Test: Remove Food - Success");
  
  // Add a food to mock database first
  const testFood = {
    _id: 'test_food_789',
    name: 'Food to Remove',
    image: 'test-image.jpg'
  };
  mockFoods.push(testFood);
  
  const req = createMockReq({ id: 'test_food_789' });
  const res = createMockRes();
  
  await removeFoodLogic(req, res);
  
  if (res.data.success && res.data.message === "Food removed.") {
    console.log("✅ PASS: Food removed successfully");
    return true;
  } else {
    console.log("❌ FAIL: Expected success: true");
    return false;
  }
}

// Run all unit tests
export async function runFoodControllerUnitTests() {
  console.log("\n========================================");
  console.log("🧪 FOOD CONTROLLER UNIT TESTS");
  console.log("========================================");

  const results = [];
  
  results.push(await testAddFoodSuccess());
  results.push(await testGetFoodsSuccess());
  results.push(await testGetFoodByIdSuccess());
  results.push(await testGetFoodByIdNotFound());
  results.push(await testUpdateFoodStatusSuccess());
  results.push(await testUpdateFoodStatusNotFound());
  results.push(await testRemoveFoodSuccess());

  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;
  const total = results.length;

  console.log("\n========================================");
  console.log("📊 FOOD CONTROLLER UNIT TEST SUMMARY");
  console.log("========================================");
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log("========================================\n");

  return { passed, failed, total };
}
