// src/server/api/routers/bot.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { bots, botDocuments } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const botRouter = createTRPCRouter({
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

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.bots.findMany({
      where: eq(bots.userId, ctx.session.user.id),
      orderBy: [desc(bots.createdAt)],
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const newBotId = nanoid();
      await ctx.db.insert(bots).values({
        id: newBotId,
        name: input.name,
        userId: ctx.session.user.id,
      });
      return { id: newBotId, name: input.name };
    }),

  // ---- ADD THIS NEW PROCEDURE ----
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the bot they are trying to update
      const [bot] = await ctx.db.select().from(bots).where(eq(bots.id, input.id));
      if (!bot || bot.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [updatedBot] = await ctx.db
        .update(bots)
        .set({
          name: input.name,
          description: input.description,
        })
        .where(eq(bots.id, input.id))
        .returning();
      
      return updatedBot;
    }),

  createDocument: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        storagePath: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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