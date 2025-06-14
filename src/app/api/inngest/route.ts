// src/app/api/inngest/route.ts

import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { processDocument, helloWorld } from '@/inngest/functions';
import { env } from '@/env.mjs'; // 1. Import your environment variables

export const runtime = 'nodejs';

// Create an API that serves all of our functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processDocument,
    helloWorld,
  ],
  // 2. THE FIX: Add the secret signing key to the server-side handler.
  // This is used to verify that incoming webhook requests are
  // genuinely from Inngest and not a malicious actor.
  signingKey: env.INNGEST_SIGNING_KEY,
});