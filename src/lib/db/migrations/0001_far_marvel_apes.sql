DO $$ BEGIN
 CREATE TYPE "public"."bot_status_enum" AS ENUM('CREATING', 'PROCESSING_DOCUMENTS', 'READY', 'ERROR', 'UPDATING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"public_url_id" varchar(32) NOT NULL,
	"rag_config" jsonb DEFAULT '{"chunkSize":500,"overlap":50,"topK":3}'::jsonb NOT NULL,
	"status" "bot_status_enum" DEFAULT 'CREATING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bots_public_url_id_unique" UNIQUE("public_url_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bots" ADD CONSTRAINT "bots_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_bots_public_url_id" ON "bots" ("public_url_id");