import { testDbConnection } from './db-connection.test.js';
import { testLoginSuccess, testLoginFailure } from './login.test.js';
import { runTests as runRegisterTests } from './register.test.js';
// import { runTests as runOrderTests } from './order.test.js';

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

  await runTest('Login Success', testLoginSuccess);
  await runTest('Login Failure', testLoginFailure);
  // Run all registration tests (with setup and cleanup)
  console.log('\n📝 Running Registration Tests Suite...');
  await runRegisterTests();
  
  // Run login tests
 


  // Run all order tests
  // console.log('\n📝 Running Order Tests Suite...');
  // await runOrderTests();

  console.log('\n🎉 All tests completed.');
  process.exit(0);
}

main();