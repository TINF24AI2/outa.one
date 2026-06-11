ALTER TABLE "license_user" DROP CONSTRAINT "license_user_license_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "license_user" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
CREATE INDEX "license_user_license_user_idx" ON "license_user" USING btree ("license_id","user_id");