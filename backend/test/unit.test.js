import { runUnitTests as runUserUnitTests } from './unit/user.controller.unit.test.js';
import { runUnitTests as runOrderUnitTests } from './unit/order.controller.unit.test.js';
import { runFoodControllerUnitTests } from './unit/food.controller.unit.test.js';

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
  console.log('\n' + '='.repeat(60));
  console.log('🔬 UNIT TEST SUITE');
  console.log('   Testing isolated functions with mocked dependencies');
  console.log('='.repeat(60));

  // Run user controller unit tests
  console.log('\n📝 Running User Controller Unit Tests...');
  await runUserUnitTests();

  // Run order controller unit tests
  console.log('\n📝 Running Order Controller Unit Tests...');
  await runOrderUnitTests();

  // Run food controller unit tests
  console.log('\n📝 Running Food Controller Unit Tests...');
  await runFoodControllerUnitTests();

  console.log('\n' + '='.repeat(60));
  console.log('🎉 All unit tests completed.');
  console.log('='.repeat(60));
  
  process.exit(0);
}

main();
