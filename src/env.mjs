// src/env.mjs

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * SERVER-SIDE VARIABLES: These are secret and only available on the server.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.preprocess(
      (str) => process.env.VERCEL_URL ?? str,
      process.env.VERCEL ? z.string().optional() : z.string().url()
    ),
    BLOB_READ_WRITE_TOKEN: z.string(),
    // THE SECRET SIGNING KEY: Used by our server to verify incoming webhooks from Inngest.
    INNGEST_SIGNING_KEY: z.string(),
  },

  /**
   * CLIENT-SIDE VARIABLES: These are public and available in the browser.
   * They MUST be prefixed with `NEXT_PUBLIC_`.
   */
  client: {
    // THE PUBLIC EVENT KEY: Used by the browser to send events to Inngest.
    NEXT_PUBLIC_INNGEST_EVENT_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes,
   * so we need to destruct manually.
   */
  runtimeEnv: {
    // Server-side variables
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    
    // Client-side variables
    NEXT_PUBLIC_INNGEST_EVENT_KEY: process.env.NEXT_PUBLIC_INNGEST_EVENT_KEY,
  },
  
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});