ALTER TABLE "product" ALTER COLUMN "requiresApproval" SET DATA TYPE boolean USING ("requiresApproval"::boolean);--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "maxLicensesPerUser" SET DATA TYPE integer USING ("maxLicensesPerUser"::integer);--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "maxLicensesPerUser" SET DEFAULT 1;--> statement-breakpoint
CREATE INDEX "license_productId_idx" ON "license" USING btree ("productId");--> statement-breakpoint
ALTER TABLE "license" ADD CONSTRAINT "license_productId_key_unique" UNIQUE("productId","key");
