// src/inngest/client.ts

// THE FIX: We must import EventSchemas separately.
import { Inngest, EventSchemas } from "inngest";
import { env } from "@/env.mjs";
import { Events } from "@/types";

// --- DEBUGGING STEP ---
console.log(`[INNGESET CLIENT DEBUG] Event Key being used: "${env.INNGEST_EVENT_KEY}"`);

// Create a client to send and receive events.
export const inngest = new Inngest({ 
  id: "rag-chatbot",
  eventKey: env.INNGEST_EVENT_KEY,
  // The schemas property is where we pass our event contracts
  // to make the client type-safe.
  schemas: new EventSchemas().fromRecord<Events>(),
});