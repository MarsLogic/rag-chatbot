// src/server/api/routers/bot.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { bots } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const botRouter = createTRPCRouter({
  
  // The getUploadPresignedUrl and confirmUpload procedures have been removed.
  
  // We will add the necessary procedures like byId, update, create, list, etc.,
  // back in here as we build the UI features that require them.
  // For now, it can be empty while we focus on the file upload feature.

});