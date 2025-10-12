import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootEnvPath = join(__dirname, '..', '..', '.env');

// Load .env from the repo root
dotenv.config({ path: rootEnvPath });

const uri = process.env.MONGODB_URI;

describe('🧩 MongoDB Connection Test', () => {
  beforeAll(async () => {
    if (!uri) {
      throw new Error('❌ No MONGODB_URI found in environment variables');
    }

    // Try to connect before running tests
    await mongoose.connect(uri, { maxPoolSize: 5 });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('✅ should connect to MongoDB successfully', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});