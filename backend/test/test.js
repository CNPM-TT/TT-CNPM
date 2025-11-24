import { testDbConnection } from './integration/db-connection.test.js';
import { runTests as runLoginTests  } from './integration/login.test.js';
import { runTests as runRegisterTests } from './integration/register.test.js';
import { runTests as runOrderTests } from './integration/order.test.js';
import { runTests as runFoodTests } from './integration/food.test.js';
import { runTests as runCartTests } from './integration/cart.test.js';
import { runTests as runRestaurantTests } from './integration/restaurant.test.js';

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
  let failedSuites = 0;
  const suiteResults = [];
  
  // Database connection test
  const dbResult = { suiteName: 'Database Connection', passed: 0, failed: 0, total: 1, failedTests: [] };
  if (!await runTest('Database Connection', testDbConnection)) {
    failedSuites++;
    dbResult.failed = 1;
    dbResult.failedTests.push('Database Connection');
  } else {
    dbResult.passed = 1;
  }
  suiteResults.push(dbResult);

  // Run all login tests
  console.log('\n📝 Running Login Tests Suite...');
  try {
    const result = await runLoginTests();
    suiteResults.push(result);
  } catch (err) {
    console.error('❌ Login tests suite failed:', err.message);
    failedSuites++;
    suiteResults.push(err.testResults || { suiteName: 'Login', passed: 0, failed: 0, total: 0, failedTests: [] });
  }

  // Run all registration tests (with setup and cleanup)
  console.log('\n📝 Running Registration Tests Suite...');
  try {
    const result = await runRegisterTests();
    suiteResults.push(result);
  } catch (err) {
    console.error('❌ Registration tests suite failed:', err.message);
    failedSuites++;
    suiteResults.push(err.testResults || { suiteName: 'Registration', passed: 0, failed: 0, total: 0, failedTests: [] });
  }
  
  // Run all order tests
  console.log('\n📝 Running Order Tests Suite...');
  try {
    const result = await runOrderTests();
    suiteResults.push(result);
  } catch (err) {
    console.error('❌ Order tests suite failed:', err.message);
    failedSuites++;
    suiteResults.push(err.testResults || { suiteName: 'Order', passed: 0, failed: 0, total: 0, failedTests: [] });
  }

  // Run all food tests
  console.log('\n📝 Running Food Tests Suite...');
  try {
    const result = await runFoodTests();
    suiteResults.push(result);
  } catch (err) {
    console.error('❌ Food tests suite failed:', err.message);
    failedSuites++;
    suiteResults.push(err.testResults || { suiteName: 'Food', passed: 0, failed: 0, total: 0, failedTests: [] });
  }

  // Run all cart tests
  console.log('\n📝 Running Cart Tests Suite...');
  try {
    const result = await runCartTests();
    suiteResults.push(result);
  } catch (err) {
    console.error('❌ Cart tests suite failed:', err.message);
    failedSuites++;
    suiteResults.push(err.testResults || { suiteName: 'Cart', passed: 0, failed: 0, total: 0, failedTests: [] });
  }

  // Run all restaurant tests
  console.log('\n📝 Running Restaurant Tests Suite...');
  try {
    const result = await runRestaurantTests();
    suiteResults.push(result);
  } catch (err) {
    console.error('❌ Restaurant tests suite failed:', err.message);
    failedSuites++;
    suiteResults.push(err.testResults || { suiteName: 'Restaurant', passed: 0, failed: 0, total: 0, failedTests: [] });
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎯 OVERALL TEST SUMMARY');
  console.log('='.repeat(70));
  
  const totalSuites = suiteResults.length;
  const passedSuites = totalSuites - failedSuites;
  const totalTests = suiteResults.reduce((sum, r) => sum + r.total, 0);
  const totalPassed = suiteResults.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = suiteResults.reduce((sum, r) => sum + r.failed, 0);
  
  console.log(`\n📊 Test Suites: ${passedSuites}/${totalSuites} passed`);
  console.log(`📊 Tests:       ${totalPassed}/${totalTests} passed`);
  
  console.log(`\n📝 Test Suite Details:`);
  console.log('─'.repeat(70));
  
  for (const result of suiteResults) {
    const status = result.failed === 0 ? '✅' : '❌';
    const stats = `${result.passed}/${result.total} passed`;
    console.log(`${status} ${result.suiteName.padEnd(25)} ${stats}`);
    
    if (result.failedTests && result.failedTests.length > 0) {
      result.failedTests.forEach(testName => {
        console.log(`     ❌ ${testName}`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (failedSuites > 0) {
    console.error(`\n❌ TEST RUN FAILED`);
    console.error(`   Suites: ${failedSuites}/${totalSuites} failed`);
    console.error(`   Tests:  ${totalFailed}/${totalTests} failed`);
    console.log('\n💡 Check the logs above for detailed error messages\n');
    process.exit(1);
  }
  
  console.log('\n✅ ALL TESTS PASSED! 🎉');
  console.log(`   ${totalTests} tests across ${totalSuites} suites\n`);
  process.exit(0);
}

main();