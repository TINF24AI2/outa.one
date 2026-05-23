CREATE TYPE "public"."license_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "license_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"status" "license_request_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "license_request" ADD CONSTRAINT "license_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_request" ADD CONSTRAINT "license_request_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "license_request_user_id_idx" ON "license_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "license_request_product_id_idx" ON "license_request" USING btree ("product_id");