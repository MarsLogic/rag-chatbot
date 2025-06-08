// src/lib/db/schema.ts

import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
  varchar,
  jsonb,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

// --- CORRECTED NEXTAUTH.JS TABLES ---

export const users = pgTable("users", { // FIX: "user" -> "users"
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  hashedPassword: text("hashedPassword"),
});

export const accounts = pgTable(
  "accounts", // FIX: "account" -> "accounts"
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", { // FIX: "session" -> "sessions"
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens", // FIX: "verificationToken" -> "verification_tokens"
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({ // Renamed for clarity
    compositePk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);


// --- EXISTING TENANT AND BOT TABLES ---
// These are already correct and do not need changes.

export const llmProviderEnum = pgEnum("llm_provider_enum", [
  "openai",
  "anthropic",
  "grok",
]);

export const tenantSettings = pgTable("tenant_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  openaiApiKey: text("openai_api_key"),
  anthropicApiKey: text("anthropic_api_key"),
  grokApiKey: text("grok_api_key"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const botStatusEnum = pgEnum('bot_status_enum', [
  'CREATING', 
  'PROCESSING_DOCUMENTS', 
  'READY', 
  'ERROR', 
  'UPDATING'
]);

export const bots = pgTable(
  "bots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id") // FIX: Changed from users.id to prevent potential issues, though it should resolve correctly.
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    publicUrlId: varchar("public_url_id", { length: 32 }).notNull().unique(),
    ragConfig: jsonb("rag_config")
      .notNull()
      .$type<{ chunkSize: number; overlap: number; topK: number }>()
      .default({ chunkSize: 500, overlap: 50, topK: 3 }),
    status: botStatusEnum("status").default("CREATING").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    publicUrlIdIdx: uniqueIndex("idx_bots_public_url_id").on(table.publicUrlId),
  })
);

// --- NEW TABLES FOR KNOWLEDGE BASE ---
// This is already correct.

export const botDocumentStatusEnum = pgEnum('bot_document_status_enum', [
  'PENDING', 
  'UPLOADED',
  'PROCESSING', 
  'PROCESSED', 
  'FAILED'
]);

export const botDocuments = pgTable("bot_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  botId: uuid("id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: integer('file_size'),
  
  storagePath: text('storage_path').unique(), 
  
  status: botDocumentStatusEnum('status').default('PENDING').notNull(),
  errorMessage: text('error_message'),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});