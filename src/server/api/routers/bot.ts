// src/server/api/routers/bot.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { bots, botDocuments } from "@/lib/db/schema"; // Ensure botDocuments is imported
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

  /**
   * Creates a document record in the database after a file has been
   * successfully uploaded to the blob store.
   */
  createDocument: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        storagePath: z.string().url(), // The final URL from Vercel Blob
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Security check: User must own the bot
      const [bot] = await ctx.db.select().from(bots).where(eq(bots.id, input.botId));
      if (!bot || bot.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const [newDocument] = await ctx.db
        .insert(botDocuments)
        .values({
          botId: input.botId,
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          storagePath: input.storagePath,
          status: 'UPLOADED',
        })
        .returning();

      return newDocument;
    }),
});