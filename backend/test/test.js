import { testDbConnection } from './db-connection.test.js';
import { testLoginSuccess, testLoginFailure } from './login.test.js';

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

  console.log('\n🎉 All tests completed.');
}

main();