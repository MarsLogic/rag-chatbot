DO $$ BEGIN
 CREATE TYPE "public"."bot_document_status_enum" AS ENUM('PENDING', 'UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bot_documents" (
	"id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(100),
	"file_size" integer,
	"storage_path" text,
	"status" "bot_document_status_enum" DEFAULT 'PENDING' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bot_documents_storage_path_unique" UNIQUE("storage_path")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bot_documents" ADD CONSTRAINT "bot_documents_id_bots_id_fk" FOREIGN KEY ("id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
