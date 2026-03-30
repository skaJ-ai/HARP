CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE "memory_chunks" (
	"content" text NOT NULL,
	"content_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deliverable_id" uuid,
	"embedding" vector NOT NULL,
	"embedding_model" text NOT NULL,
	"embedding_version" integer DEFAULT 1 NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"section_name" text,
	"session_id" uuid,
	"source_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"template_type" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"workspace_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memory_chunks" ADD CONSTRAINT "memory_chunks_deliverable_id_deliverables_id_fk" FOREIGN KEY ("deliverable_id") REFERENCES "public"."deliverables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_chunks" ADD CONSTRAINT "memory_chunks_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_chunks" ADD CONSTRAINT "memory_chunks_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_chunks" ADD CONSTRAINT "memory_chunks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_memory_chunks_content_hash" ON "memory_chunks" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "idx_memory_chunks_deliverable_id" ON "memory_chunks" USING btree ("deliverable_id");--> statement-breakpoint
CREATE INDEX "idx_memory_chunks_kind" ON "memory_chunks" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "idx_memory_chunks_fts" ON "memory_chunks" USING gin (to_tsvector('simple', "content"));--> statement-breakpoint
CREATE INDEX "idx_memory_chunks_session_id" ON "memory_chunks" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_memory_chunks_source_id" ON "memory_chunks" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_memory_chunks_status" ON "memory_chunks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_memory_chunks_template_type" ON "memory_chunks" USING btree ("template_type");--> statement-breakpoint
CREATE INDEX "idx_memory_chunks_workspace_status" ON "memory_chunks" USING btree ("workspace_id","status");
