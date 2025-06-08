// src/server/api/routers/bot.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { bots, botDocuments } from "@/lib/db/schema"; // <-- ADD botDocuments
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
// --- You'll need to create these R2 helper files in a later step ---
// import { createPresignedUrl, deleteFile } from "@/lib/r2"; 

export const botRouter = createTRPCRouter({
  // --- ADD THE FOLLOWING TWO PROCEDURES ---

  // 1. GET A SECURE UPLOAD URL
  getUploadPresignedUrl: protectedProcedure
    .input(z.object({ botId: z.string(), fileName: z.string(), fileType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Security Check: Ensure the user owns the bot they're uploading to
      const [bot] = await ctx.db.select().from(bots).where(eq(bots.id, input.botId)).limit(1);
      if (!bot || bot.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Create a record for the document in our database first
      const [newDocument] = await ctx.db.insert(botDocuments).values({
        botId: input.botId,
        fileName: input.fileName,
        fileType: input.fileType,
        storagePath: `bots/${input.botId}/sources/${nanoid()}-${input.fileName}`,
      }).returning();
      
      // Get the secure upload URL from our R2 helper (we'll build this later)
      // const { url, path } = await createPresignedUrl(newDocument.storagePath, input.fileType);
      
      // For now, we'll return placeholder data. This will be replaced.
      return {
        uploadUrl: "https://placeholder.url/for-now",
        documentId: newDocument.id,
      };
    }),
  
  // 2. CONFIRM THE UPLOAD IS COMPLETE
  confirmUpload: protectedProcedure
    .input(z.object({ botId: z.string(), documentId: z.string(), fileSize: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Here we would update the document record with the file size and trigger processing.
      // For now, it just confirms the flow.
      await ctx.db
        .update(botDocuments)
        .set({ fileSize: input.fileSize, status: "UPLOADED" })
        .where(eq(botDocuments.id, input.documentId));
      
      return { success: true };
    }),

  // --- EXISTING PROCEDURES (NO CHANGES) ---
  // byId, update, create, list procedures remain here...
});