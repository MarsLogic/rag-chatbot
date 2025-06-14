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
  customType, // Import customType
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

// --- PG VECTOR SETUP ---
// This constant MUST match the output dimension of the embedding model you use.
// For example, OpenAI's text-embedding-3-small is 1536, while many open-source
// models like nomic-embed-text are 768. We will start with 768.
const embeddingDimension = 768; 
const vectorType = customType<{ data: number[]; mode: "vector" }>({
    dataType() {
        return `vector(${embeddingDimension})`;
    },
    toDriver(value: number[]): string {
        return `[${value.join(',')}]`;
    },
});


// --- CORRECTED NEXTAUTH.JS TABLES ---

export const users = pgTable("users", {
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
  "accounts",
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

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compositePk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);


// --- YOUR OTHER TABLES ---

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
    userId: text("user_id")
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

export const botDocumentStatusEnum = pgEnum('bot_document_status_enum', [
  'PENDING', 
  'UPLOADED',
  'PROCESSING', 
  'PROCESSED', 
  'FAILED'
]);

export const botDocuments = pgTable("bot_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  botId: uuid("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: integer('file_size'),
  
  storagePath: text('storage_path').unique(), 
  
  status: botDocumentStatusEnum('status').default('PENDING').notNull(),
  errorMessage: text('error_message'),
  
  // NEW COLUMNS
  chunkCount: integer('chunk_count').default(0),
  processedAt: timestamp('processed_at', { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

// NEW TABLE
export const botDocumentChunks = pgTable('bot_document_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  botId: uuid('bot_id').notNull().references(() => bots.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => botDocuments.id, { onDelete: 'cascade' }),
  chunkText: text('chunk_text').notNull(),
  embedding: vectorType('embedding').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});