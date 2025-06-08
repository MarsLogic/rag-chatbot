// src/server/api/routers/user.ts

import { z } from "zod";
// This is the corrected import path
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"; 
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  /**
   * Get the current user's profile information.
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    return user;
  }),

  /**
   * Update the current user's profile information.
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name cannot be empty."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          name: input.name,
        })
        .where(eq(users.id, ctx.session.user.id));

      return { success: true };
    }),
});