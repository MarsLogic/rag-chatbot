// src/server/api/routers/bot.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { bots } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const botRouter = createTRPCRouter({
  /**
   * Fetches a single bot by its ID.
   * Ensures the user owns the bot.
   */
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [bot] = await ctx.db
        .select()
        .from(bots)
        .where(eq(bots.id, input.id));

      if (!bot || bot.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return bot;
    }),

  /**
   * Fetches all bots for the current logged-in user.
   */
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.bots.findMany({
      where: eq(bots.userId, ctx.session.user.id),
      orderBy: [desc(bots.createdAt)],
    });
  }),

  /**
   * Creates a new bot for the current user.
   */
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const newBotId = nanoid();
      await ctx.db.insert(bots).values({
        id: newBotId,
        name: input.name,
        userId: ctx.session.user.id,
      });
      return { id: newBotId };
    }),

  // NOTE: The file upload procedures are correctly handled in /api/upload/route.ts
  // and are not needed here.
});