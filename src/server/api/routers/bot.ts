// src/server/api/routers/bot.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { bots, botDocuments } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { del } from '@vercel/blob';
import { inngest } from "@/inngest/client"; // <-- IMPORT INNGEST

export const botRouter = createTRPCRouter({
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [bot] = await ctx.db.select().from(bots).where(eq(bots.id, input.id));
      if (!bot || bot.userId !== ctx.session.user.id!) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return bot;
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.bots.findMany({
      where: eq(bots.userId, ctx.session.user.id!),
      orderBy: [desc(bots.createdAt)],
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [newBot] = await ctx.db
        .insert(bots)
        .values({
          name: input.name,
          userId: ctx.session.user.id!,
          publicUrlId: nanoid(10),
        })
        .returning();

      if (!newBot) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create bot.",
        });
      }

      return newBot;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [bot] = await ctx.db.select().from(bots).where(eq(bots.id, input.id));
      if (!bot || bot.userId !== ctx.session.user.id!) {
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
  
  listDocuments: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [bot] = await ctx.db
        .select({ id: bots.id })
        .from(bots)
        .where(
          and(eq(bots.id, input.botId), eq(bots.userId, ctx.session.user.id!))
        );
      if (!bot) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      return ctx.db.query.botDocuments.findMany({
        where: eq(botDocuments.botId, input.botId),
        orderBy: [desc(botDocuments.createdAt)],
      });
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
      const [bot] = await ctx.db
        .select({ id: bots.id })
        .from(bots)
        .where(
          and(eq(bots.id, input.botId), eq(bots.userId, ctx.session.user.id!))
        );
      if (!bot) {
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

      // --- TRIGGER THE BACKGROUND JOB ---
      await inngest.send({
        name: "app/document.uploaded",
        data: {
          documentId: newDocument.id,
        },
      });
      // -----------------------------------

      return newDocument;
    }),
  
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [doc] = await ctx.db
        .select({ 
            id: botDocuments.id, 
            storagePath: botDocuments.storagePath,
            userId: bots.userId 
        })
        .from(botDocuments)
        .leftJoin(bots, eq(botDocuments.botId, bots.id))
        .where(eq(botDocuments.id, input.documentId));

      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (doc.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (doc.storagePath) {
        await del(doc.storagePath);
      }

      // TODO: In the future, also delete associated chunks from the bot_document_chunks table
      
      await ctx.db.delete(botDocuments).where(eq(botDocuments.id, input.documentId));

      return { success: true };
    }),
});