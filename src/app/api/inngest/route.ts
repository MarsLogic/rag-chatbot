// src/app/api/inngest/route.ts

import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { processDocument } from '@/inngest/functions';

// This is the crucial fix. It tells Vercel/Next.js to run this API route
// in the full Node.js runtime, which our LangChain loaders require.
export const runtime = 'nodejs';

// Create an API that serves all of our functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processDocument, // <-- Add our function here
  ],
});