import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const API_URL = process.env.DOMAIN;

// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();
// const API_URL = process.env.DOMAIN;

// export async function testLoginSuccess() {
//   console.log("\n🧪 Testing successful login...");
//   try {
//     const res = await axios.post(`${API_URL}/api/user/login`, {
//       email: "triet@gmail.com",
//       password: "Triet1208@",
//     });

//     console.log("📩 Response data:", res.data);

//     if (!res.data.success) throw new Error("Expected success but got failure");
//     if (!res.data.token) throw new Error("No token returned");
//     console.log("✅ Login success verified for:", res.data.email);
    
//     return res.data;
//   } catch (err) {
//     console.error("❌ Test failed with error:", err.response?.data || err.message);
//     throw err;
//   }
// }

// export async function testLoginFailure() {
//   console.log("\n🧪 Testing failed login (wrong password)...");
  
//   try {
//     const res = await axios.post(`${API_URL}/api/user/login`, {
//       email: "triet@gmail.com",
//       password: "WrongPassword123",
//     });

//     console.log("📩 Response data:", res.data);

//     if (res.data.success) throw new Error("Expected failure but got success");
//     if (!res.data.message.includes("Incorrect password")) {
//       throw new Error("Expected 'Incorrect password' message");
//     }
//     console.log("✅ Login failure handled correctly");
//   } catch (err) {
//     console.error("❌ Test failed with error:", err.response?.data || err.message);
//     throw err;
//   }
// }

// export async function testLoginNonExistentUser() {
//   console.log("\n🧪 Testing login with non-existent user...");
  
//   try {
//     const res = await axios.post(`${API_URL}/api/user/login`, {
//       email: "nonexistent@test.com",
//       password: "SomePassword123",
//     });

//     console.log("📩 Response data:", res.data);

//     if (res.data.success) throw new Error("Expected failure but got success");
//     if (!res.data.message.includes("doesn't exists")) {
//       throw new Error("Expected 'doesn't exists' message");
//     }
//     console.log("✅ Non-existent user handled correctly");
//   } catch (err) {
//     console.error("❌ Test failed with error:", err.response?.data || err.message);
//     throw err;
//   }
// }

// // Main test runner
// export async function runTests() {
//   let passed = 0;
//   let failed = 0;
//   const tests = [
//     { name: "Login Success", fn: testLoginSuccess },
//     { name: "Login Failure (Wrong Password)", fn: testLoginFailure },
//     { name: "Login Non-Existent User", fn: testLoginNonExistentUser },
//   ];

//   for (const test of tests) {
//     try {
//       await test.fn();
//       passed++;
//     } catch (error) {
//       failed++;
//     }
//   }

//   console.log("\n" + "=".repeat(50));
//   console.log("📊 Login Test Suite Summary:");
//   console.log(`   ✅ Passed: ${passed}`);
//   console.log(`   ❌ Failed: ${failed}`);
//   console.log(`   📝 Total:  ${tests.length}`);
//   console.log("=".repeat(50));

//   if (failed > 0) {
//     throw new Error(`${failed} login test(s) failed`);
//   }
// }

// // Run tests if this file is executed directly
// if (import.meta.url === `file://${process.argv[1]}`) {
//   runTests().then(() => process.exit(0)).catch(() => process.exit(1));
// }

// ============================================
// OLD VERSION (for comparison)
// ============================================
// This was the original login test before changes
// Uncomment below to use the old version

export async function testLoginSuccess_OLD() {
  console.log("\n🧪 Testing successful login...");
  try {
    const res = await axios.post(`${API_URL}/api/user/login`, {
      email: "triet@gmail.com",
      password: "Triet1208@",
    });

    console.log("📩 Response data:", res.data);

    if (!res.data.success) throw new Error("Expected success but got failure");
    console.log("✅ Login success verified for:", res.data.email);
  } catch (err) {
    console.error("❌ Test failed with error:", err.response?.data || err.message);
    throw err;
  }
}

export async function testLoginFailure_OLD() {
  console.log("\n🧪 Testing failed login (wrong password)...");
  const res = await axios.post(`${API_URL}/api/user/login`, {
    email: "triet@gmail.com",
    password: "WrongPassword123",
  });

  if (res.data.success) throw new Error("Expected failure but got success");
  console.log("✅ Login failure handled correctly");
}

