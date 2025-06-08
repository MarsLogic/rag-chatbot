// drizzle.config.ts

import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Manually load environment variables from the .env file
dotenv.config({ path: '.env' });

// Check if the DATABASE_URL is set and throw a clear error if not
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
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