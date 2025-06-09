// drizzle.config.local.ts

import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// ---- START DEBUGGING ----
console.log('>> Running drizzle.config.local.ts...');
dotenv.config({ path: '.env' });
console.log('>> Is DATABASE_URL set after loading .env?', !!process.env.DATABASE_URL);
// ---- END DEBUGGING ----

// Check if the DATABASE_URL is set and throw a clear error if not
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Please ensure the .env file exists in the root directory and contains the DATABASE_URL.");
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // The connection string URL
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});