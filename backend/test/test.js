import { testDbConnection } from './integration/db-connection.test.js';
import { runTests as runLoginTests  } from './integration/login.test.js';
import { runTests as runRegisterTests } from './integration/register.test.js';
import { runTests as runOrderTests } from './integration/order.test.js';
import { runTests as runFoodTests } from './integration/food.test.js';
import { runTests as runCartTests } from './integration/cart.test.js';
import { runTests as runRestaurantOrderTests } from './integration/restaurant-order.test.js';
// import { runTests as runRestaurantTests } from './integration/restaurant.test.js';

async function runTest(name, fn) {
  console.log(`\n🔹 Running: ${name}`);
  try {
    await fn();
    console.log(`✅ ${name} passed`);
    return true;
  } catch (err) {
    console.error(`❌ ${name} failed:`, err.message || err);
    return false;
  }
}

async function main() {
  let failedTests = 0;
  
  if (!await runTest('Database Connection', testDbConnection)) failedTests++;

  // Run all login tests
  console.log('\n📝 Running Login Tests Suite...');
  try {
    await runLoginTests();
  } catch (err) {
    console.error('❌ Login tests suite failed:', err.message);
    failedTests++;
  }

  // Run all registration tests (with setup and cleanup)
  console.log('\n📝 Running Registration Tests Suite...');
  try {
    await runRegisterTests();
  } catch (err) {
    console.error('❌ Registration tests suite failed:', err.message);
    failedTests++;
  }
  
  // Run all order tests
  console.log('\n📝 Running Order Tests Suite...');
  try {
    await runOrderTests();
  } catch (err) {
    console.error('❌ Order tests suite failed:', err.message);
    failedTests++;
  }

  // Run all food tests
  console.log('\n📝 Running Food Tests Suite...');
  try {
    await runFoodTests();
  } catch (err) {
    console.error('❌ Food tests suite failed:', err.message);
    failedTests++;
  }

  // Run all cart tests
  console.log('\n📝 Running Cart Tests Suite...');
  try {
    await runCartTests();
  } catch (err) {
    console.error('❌ Cart tests suite failed:', err.message);
    failedTests++;
  }

  // Run all restaurant order filtering tests
  console.log('\n📝 Running Restaurant Order Filtering Tests Suite...');
  try {
    await runRestaurantOrderTests();
  } catch (err) {
    console.error('❌ Restaurant order filtering tests suite failed:', err.message);
    failedTests++;
  }

  // Run all restaurant tests
  // console.log('\n📝 Running Restaurant Tests Suite...');
  // try {
  //   await runRestaurantTests();
  // } catch (err) {
  //   console.error('❌ Restaurant tests suite failed:', err.message);
  //   failedTests++;
  // }

  console.log('\n🎉 All tests completed.');
  
  if (failedTests > 0) {
    console.error(`\n❌ ${failedTests} test suite(s) failed`);
    process.exit(1);
  }
  
  process.exit(0);
}

main();