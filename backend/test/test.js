import { testDbConnection } from './db-connection.test.js';
import { testLoginSuccess, testLoginFailure } from './login.test.js';
import { 
  testRegisterSuccess, 
  testRegisterDuplicateEmail, 
  testRegisterInvalidEmail, 
  testRegisterWeakPassword 
} from './register.test.js';

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
  
  // Registration tests
  await runTest('Register Success', testRegisterSuccess);
  await runTest('Register Duplicate Email', testRegisterDuplicateEmail);
  await runTest('Register Invalid Email', testRegisterInvalidEmail);
  await runTest('Register Weak Password', testRegisterWeakPassword);
  
  // Login tests
  await runTest('Login Success', testLoginSuccess);
  await runTest('Login Failure', testLoginFailure);

  console.log('\n🎉 All tests completed.');
}

main();