// drizzle.config.ts

import { defineConfig } from 'drizzle-kit';
import 'dotenv/config'; // Make sure to install dotenv: npm install -D dotenv

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});