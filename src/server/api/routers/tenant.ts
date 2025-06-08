// src/server/api/routers/tenant.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc"; 
import { tenantSettings } from "@/lib/db/schema";
import { encrypt } from "@/lib/security/crypto";
import { eq } from "drizzle-orm";

const llmProviderZodEnum = z.enum(["openai", "anthropic", "grok"]);
type LlmProvider = z.infer<typeof llmProviderZodEnum>;

const providerToColumnMap: Record<LlmProvider, keyof typeof tenantSettings.$inferInsert> = {
  openai: "openaiApiKey",
  anthropic: "anthropicApiKey",
  grok: "grokApiKey",
};

export const tenantRouter = createTRPCRouter({
  getApiKeyStatus: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db.query.tenantSettings.findFirst({
      where: eq(tenantSettings.userId, ctx.session.user.id!),
    });

    return {
      openai: !!settings?.openaiApiKey,
      anthropic: !!settings?.anthropicApiKey,
      grok: !!settings?.grokApiKey,
    };
  }),

  saveApiKey: protectedProcedure
    .input(
      z.object({
        provider: llmProviderZodEnum,
        apiKey: z.string().min(1, "API Key cannot be empty."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { provider, apiKey } = input;
      const encryptedKey = encrypt(apiKey);
      const columnToUpdate = providerToColumnMap[provider];

      await ctx.db
        .insert(tenantSettings)
        .values({
          userId: ctx.session.user.id!,
          [columnToUpdate]: encryptedKey,
        })
        .onConflictDoUpdate({
          target: tenantSettings.userId,
          set: {
            [columnToUpdate]: encryptedKey,
            updatedAt: new Date(),
          },
        });

      return { success: true, provider };
    }),

  removeApiKey: protectedProcedure
    // CORRECTED THIS LINE
    .input(z.object({ provider: llmProviderZodEnum }))
    .mutation(async ({ ctx, input }) => {
      const { provider } = input;
      const columnToUpdate = providerToColumnMap[provider];

      await ctx.db
        .update(tenantSettings)
        .set({ [columnToUpdate]: null, updatedAt: new Date() })
        .where(eq(tenantSettings.userId, ctx.session.user.id!));

      return { success: true, provider };
    }),
});