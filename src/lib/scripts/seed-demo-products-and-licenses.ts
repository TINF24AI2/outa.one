import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { license, product } from "$lib/server/db/schema";

import { loadEnv } from "./utils";

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = postgres(DATABASE_URL);
const db = drizzle(client);

const DEMO_PRODUCTS = [
  {
    name: "Outa Professional",
    description: "Full suite of tools for professional developers.",
    requiresApproval: false,
    maxLicensesPerUser: 5,
  },
  {
    name: "Outa Enterprise",
    description: "Advanced features for large organizations.",
    requiresApproval: true,
    maxLicensesPerUser: 0,
  },
  {
    name: "Outa Starter",
    description: "Perfect for small teams and individuals.",
    requiresApproval: false,
    maxLicensesPerUser: 1,
  },
];

async function seed() {
  console.log("Seeding products and licenses...");

  for (const p of DEMO_PRODUCTS) {
    const [existing] = await db.select().from(product).where(eq(product.name, p.name));

    let productId: string;

    if (existing) {
      console.log(`  skip  product: ${p.name} (already exists)`);
      productId = existing.id;
    } else {
      const [newProduct] = await db
        .insert(product)
        .values({
          name: p.name,
          description: p.description,
          requiresApproval: p.requiresApproval,
          maxLicensesPerUser: p.maxLicensesPerUser,
        })
        .returning();
      console.log(`  added product: ${p.name}`);
      productId = newProduct.id;
    }

    // Add some licenses for each product
    // We use a prefix based on the name to make them distinct
    const prefix = p.name.split(" ")[1].toUpperCase();
    const licenseKeys = [`${prefix}-KEY-001`, `${prefix}-KEY-002`, `${prefix}-KEY-003`];

    for (const key of licenseKeys) {
      const [existingLicense] = await db
        .select()
        .from(license)
        .where(and(eq(license.key, key), eq(license.productId, productId)));
      if (existingLicense) {
        console.log(`    skip  license: ${key} (already exists)`);
        continue;
      }

      await db.insert(license).values({
        key,
        usageVolume: Math.floor(Math.random() * 50),
        productId,
      });
      console.log(`    added license: ${key}`);
    }
  }

  console.log("Seeding completed successfully.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
