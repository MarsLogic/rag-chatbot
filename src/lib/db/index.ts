// src/lib/db/index.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Next.js automatically loads the .env file, so we don't need to import dotenv/config.
// We use the non-null assertion operator (!) because we are certain
// that DATABASE_URL will be available in the environment.
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });