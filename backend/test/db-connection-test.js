#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from repo root if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootEnvPath = join(__dirname, '..', '..', '.env');

dotenv.config({ path: rootEnvPath });

const uri = process.env.MONGODB_URI;

console.log('Testing database connection using MONGODB_URI presence:', !!process.env.MONGODB_URI);

async function run() {
  try {
    await mongoose.connect(uri, { maxPoolSize: 5 });
    console.log('\u2705 Successfully connected to MongoDB');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\u274c Failed to connect to MongoDB');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
