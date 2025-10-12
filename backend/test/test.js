import { runCLI } from 'jest';
import fs from 'fs';
import path from 'path';

const testDir = path.resolve('backend/test');

async function runTestsSequentially() {
  console.log('🧪 Running Jest tests sequentially...\n');

  const files = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'));

  for (const file of files) {
    console.log(`\n🔹 Running test: ${file}`);

    const result = await runCLI(
      {
        roots: ['<rootDir>/backend/test'],
        testMatch: [`**/${file}`],
        verbose: true,
        runInBand: true
      },
      [process.cwd()]
    );

    if (result.results.success) {
      console.log(`✅ ${file} passed!`);
    } else {
      console.error(`❌ ${file} failed.`);
      process.exit(1);
    }

    // Optional: small delay between tests (e.g., DB cleanup, throttling)
    await new Promise(res => setTimeout(res, 1000));
  }

  console.log('\n🎉 All tests finished!');
  process.exit(0);
}

runTestsSequentially().catch(err => {
  console.error('❌ Jest execution failed:', err);
  process.exit(1);
});
