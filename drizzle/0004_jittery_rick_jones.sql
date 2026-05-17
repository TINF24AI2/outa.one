CREATE TABLE "license_user" (
	"license_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "license_user_license_id_user_id_pk" PRIMARY KEY("license_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "license_user" ADD CONSTRAINT "license_user_license_id_license_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."license"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_user" ADD CONSTRAINT "license_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "license_user_user_id_idx" ON "license_user" USING btree ("user_id");