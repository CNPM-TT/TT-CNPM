import axios from "axios";
import dotenv from "dotenv";
import foodModel from "../../../database/models/food.model.js";
import { connectDb } from "../../../database/db.js";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();
const API_URL = process.env.DOMAIN;

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data - using a unique food name for each test run
const generateTestFoodName = () => `Test Food ${Date.now()}`;

let testFoodId = null;

// Setup: Connect to database before tests
export async function setup() {
  await connectDb();
}

// Cleanup: Delete test food after tests
// export async function cleanup() {
//   if (testFoodId) {
//     console.log(`\n🧹 Cleaning up test food: ${testFoodId}`);
//     try {
//       await foodModel.findByIdAndDelete(testFoodId);
//       console.log("✅ Test food deleted successfully");
//     } catch (error) {
//       console.error("❌ Error deleting test food:", error.message);
//     }
//   }
// }

export async function testAddFood() {
  console.log("\n🧪 Testing add food...");
  
  try {
    const formData = new FormData();
    formData.append("name", generateTestFoodName());
    formData.append("description", "This is a test food item");
    formData.append("price", "15.99");
    formData.append("category", "Test");
    formData.append("available", "true");
    formData.append("veg", "true");
    
    // Use existing test image file
    const testImagePath = path.join(__dirname, "testimages2.jpg");
    formData.append("image", fs.createReadStream(testImagePath));

    const res = await axios.post(`${API_URL}/api/food/add`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    console.log("✅ Food added successfully");
    
    // Try to find the added food
    const foods = await foodModel.find({}).sort({ _id: -1 }).limit(1);
    if (foods.length > 0) {
      testFoodId = foods[0]._id.toString();
      console.log("📝 Test food ID:", testFoodId);
    }
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testGetFoods() {
  console.log("\n🧪 Testing get all foods...");
  
  try {
    const res = await axios.get(`${API_URL}/api/food/list`);

    console.log("📩 Response data (first item):", res.data.data?.[0]);
    console.log("📊 Total foods:", res.data.data?.length);

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!Array.isArray(res.data.data)) throw new Error("Expected data array");
    console.log("✅ Foods retrieved successfully");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testGetFoodById() {
  console.log("\n🧪 Testing get food by ID...");
  
  if (!testFoodId) {
    console.log("⚠️  No test food ID available, skipping test");
    return;
  }
  
  try {
    const res = await axios.get(`${API_URL}/api/food/getFoodById/${testFoodId}`);

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    if (!res.data.data) throw new Error("Expected food data");
    console.log("✅ Food retrieved by ID successfully");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testGetFoodByIdNotFound() {
  console.log("\n🧪 Testing get food by invalid ID...");
  
  try {
    const fakeId = "507f1f77bcf86cd799439011"; // Valid MongoDB ObjectId format but doesn't exist
    const res = await axios.get(`${API_URL}/api/food/getFoodById/${fakeId}`);

    console.log("📩 Response data:", res.data);

    if (res.data.success) throw new Error("Expected failure but got success");
    if (!res.data.message.includes("not found") && !res.data.message.includes("No food details")) {
      throw new Error("Expected 'not found' message");
    }
    console.log("✅ Invalid food ID handled correctly");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testUpdateFoodStatus() {
  console.log("\n🧪 Testing update food status...");
  
  if (!testFoodId) {
    console.log("⚠️  No test food ID available, skipping test");
    return;
  }
  
  try {
    const res = await axios.patch(
      `${API_URL}/api/food/update/available/${testFoodId}`,
      {
        name: "Updated Test Food",
        price: 19.99,
        available: false
      }
    );

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    console.log("✅ Food status updated successfully");
    
    return res.data;
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testRemoveFood() {
  console.log("\n🧪 Testing remove food...");
  console.log("📝 Test food ID:", testFoodId);
  if (!testFoodId) {
    console.log("⚠️  No test food ID available, skipping test");
    return;
  }
  
  try {
    const res = await axios.post(
      `${API_URL}/api/food/remove`,
      {
        // id: testFoodId
      }
    );

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    console.log("✅ Food removed successfully");
    
    // Clear testFoodId so cleanup doesn't try to delete it again
    testFoodId = null;
    
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
  const failedTests = [];
  const tests = [
    { name: "Add Food", fn: testAddFood },
    { name: "Get All Foods", fn: testGetFoods },
    { name: "Get Food By ID", fn: testGetFoodById },
    { name: "Get Food By Invalid ID", fn: testGetFoodByIdNotFound },
    { name: "Update Food Status", fn: testUpdateFoodStatus },
    { name: "Remove Food", fn: testRemoveFood },
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
    console.log("📊 Food Test Suite Summary:");
    console.log("=".repeat(50));
    console.log(`✅ Passed: ${passed}/${tests.length}`);
    console.log(`❌ Failed: ${failed}/${tests.length}`);
    console.log("=".repeat(50) + "\n");

    if (failed > 0) {
      const error = new Error(`${failed} food test(s) failed`);
      error.testResults = { passed, failed, total: tests.length, failedTests, suiteName: 'Food' };
      throw error;
    }
  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
    if (!error.testResults) {
      error.testResults = { passed, failed, total: tests.length, failedTests, suiteName: 'Food' };
    }
    throw error;
  }
  
  return { passed, failed, total: tests.length, failedTests, suiteName: 'Food' };
}
