// src/server/api/routers/auth.ts

import { createTRPCRouter, publicProcedure } from "../trpc";
import { auth } from "@/server/auth"; // Imports the auth function from the file we just moved

export const authRouter = createTRPCRouter({
  /**
   * A public procedure to get the current session information.
   * The frontend will call this to see if a user is logged in.
   */
  getSession: publicProcedure.query(async () => {
    const session = await auth();
    return session;
  }),
});