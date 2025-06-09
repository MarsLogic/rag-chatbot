// src/app/(api)/auth/[...nextauth]/route.ts

// This runtime setting is correct and necessary.
export const runtime = "nodejs";

import { handlers } from "@/server/auth";

// This is a more explicit and robust way to export the handlers.
export const GET = handlers.GET;
export const POST = handlers.POST;