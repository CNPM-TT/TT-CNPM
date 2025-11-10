import { testDbConnection } from './integration/db-connection.test.js';
import { runTests as runLoginTests  } from './integration/login.test.js';
import { runTests as runRegisterTests } from './integration/register.test.js';
import { runTests as runOrderTests } from './integration/order.test.js';
import { runTests as runFoodTests } from './integration/food.test.js';

async function runTest(name, fn) {
  console.log(`\n🔹 Running: ${name}`);
  try {
    await fn();
    console.log(`✅ ${name} passed`);
  } catch (err) {
    console.error(`❌ ${name} failed:`, err.message || err);
  }
}

async function main() {
  await runTest('Database Connection', testDbConnection);

  await runLoginTests();
  // Run all registration tests (with setup and cleanup)
  console.log('\n📝 Running Registration Tests Suite...');
  await runRegisterTests();
  
  // Run all order tests
  console.log('\n📝 Running Order Tests Suite...');
  await runOrderTests();

  // Run all food tests
  console.log('\n📝 Running Food Tests Suite...');
  await runFoodTests();

  console.log('\n🎉 All tests completed.');
  process.exit(0);
}

main();