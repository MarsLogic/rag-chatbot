// src/inngest/client.ts

import { Inngest } from "inngest";
import { env } from "@/env.mjs";

// --- DEBUGGING STEP ---
// We are logging the value to the server console to make sure it's being loaded correctly.
console.log(`[INNGESET CLIENT DEBUG] Event Key being used: "${env.INNGEST_EVENT_KEY}"`);

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "rag-chatbot",
  eventKey: env.INNGEST_EVENT_KEY,
});