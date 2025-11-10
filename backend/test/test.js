import { testDbConnection } from './db-connection.test.js';
import { runTests as runLoginTests } from './login.test.js';
import { runTests as runRegisterTests } from './register.test.js';

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
  
  // Run all registration tests (with setup and cleanup)
  console.log('\n📝 Running Registration Tests Suite...');
  await runRegisterTests();
  
  // Run all login tests
  console.log('\n📝 Running Login Tests Suite...');
  await runLoginTests();

  console.log('\n🎉 All tests completed.');
  process.exit(0);
}

main();