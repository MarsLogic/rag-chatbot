// src/inngest/client.ts

import { Inngest, EventSchemas } from "inngest";
import { env } from "@/env.mjs";
import { Events } from "@/types";

// This client is used in your browser-side components.
export const inngest = new Inngest({ 
  id: "rag-chatbot",
  // It correctly uses the PUBLIC environment variable.
  eventKey: env.NEXT_PUBLIC_INNGEST_EVENT_KEY,
  schemas: new EventSchemas().fromRecord<Events>(),
});