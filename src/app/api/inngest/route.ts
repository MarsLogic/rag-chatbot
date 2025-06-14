// src/app/api/inngest/route.ts

import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
// Import BOTH functions from the functions file
import { processDocument, helloWorld } from '@/inngest/functions';

// This is the crucial fix. It tells Vercel/Next.js to run this API route
// in the full Node.js runtime.
export const runtime = 'nodejs';

// Create an API that serves all of our functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processDocument,
    helloWorld, // <-- Add our new test function to the array
  ],
});