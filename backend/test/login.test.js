import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const API_URL = process.env.DOMAIN;

export async function testLoginSuccess() {
  console.log("\n🧪 Testing successful login...");
  const res = await axios.post(`${API_URL}/api/user/login`, {
    email: "triet@gmail.com",
    password: "Triet1208@",
  });

  if (!res.data.success) throw new Error("Expected success but got failure");
  console.log("✅ Login success verified for:", res.data.email);
}

export async function testLoginFailure() {
  console.log("\n🧪 Testing failed login (wrong password)...");
  const res = await axios.post(`${API_URL}/api/user/login`, {
    email: "triet@gmail.com",
    password: "WrongPassword123",
  });

  if (res.data.success) throw new Error("Expected failure but got success");
  console.log("✅ Login failure handled correctly");
}