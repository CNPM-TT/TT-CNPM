import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const uri = process.env.MONGODB_URI;
console.log('Using MONGODB_URI:', uri ? '(present)' : '(missing)');

// Test the MongoDB connection
test();

async function test() {
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { maxPoolSize: 5 });
    console.log('✅ Successfully connected to MongoDB');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
}

