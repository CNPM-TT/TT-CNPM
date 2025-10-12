import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootEnvPath = join(__dirname, '..', '..', '.env');

dotenv.config({ path: rootEnvPath });

const uri = process.env.MONGODB_URI;

export async function testDbConnection() {
  console.log('\n🧪 Testing database connection...');

  try {
    await mongoose.connect(uri, { maxPoolSize: 5 });
    console.log('✅ Successfully connected to MongoDB');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB');
    console.error(err.message || err);
    throw err; // Let test.js handle failure
  }
}
