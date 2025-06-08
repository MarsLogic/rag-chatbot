// src/server/api/routers/_app.ts

import { createTRPCRouter } from "../trpc";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { botRouter } from "./bot"; // <-- FIX: Import the new bot router

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  account: userRouter,
  bot: botRouter, // <-- FIX: Add the bot router to the main app router
});

// export type definition of API
export type AppRouter = typeof appRouter;