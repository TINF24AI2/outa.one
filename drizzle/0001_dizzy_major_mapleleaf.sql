CREATE TABLE "license" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"key" text NOT NULL,
	"usageVolume" integer NOT NULL,
	"productId" uuid
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"requiresApproval" text NOT NULL,
	"maxLicensesPerUser" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "license" ADD CONSTRAINT "license_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;