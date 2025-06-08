// src/app/api/auth/[...nextauth]/route.ts

// This line is the fix. It forces this API route to run in the Node.js runtime,
// preventing the build error caused by server-side dependencies like the database adapter.
export const runtime = "nodejs";

import { handlers } from "@/server/auth";
export const { GET, POST } = handlers;