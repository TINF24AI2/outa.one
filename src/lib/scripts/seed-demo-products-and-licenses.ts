/**
 * Seeds all demo data: users, products, licenses, assignments, and requests.
 * Run with: pnpm db:seed
 * Requires DATABASE_URL to be set (loaded from .env automatically).
 */
import { and, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { DEMO_PASSWORD, DEMO_USERS } from "$lib/demo-users";
import { account, user as userTable } from "$lib/server/db/auth.schema";
import { auditLog, license, licenseRequest, licenseUser, product } from "$lib/server/db/schema";

import { loadEnv } from "./utils";

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const { hashPassword } = await import("better-auth/crypto");

const client = postgres(DATABASE_URL);
const db = drizzle(client);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const DEMO_PRODUCTS = [
  {
    name: "Microsoft 365",
    description: "Cloud-based productivity suite including Word, Excel, PowerPoint, Teams, and OneDrive.",
    requiresApproval: false,
    maxLicensesPerUser: 1,
    licenses: [
      { key: "M365-TXKQP-7H2RN-BVCJ4-WY9DM", usageVolume: 1 },
      { key: "M365-RPLJ8-KD4NX-CFMQ3-SZ7WB", usageVolume: 1 },
      { key: "M365-GNVH6-2YT9A-XMPKE-QR1CL", usageVolume: 1 },
      { key: "M365-HBJW5-FZ3UC-DPNY7-AK8VT", usageVolume: 1 },
      { key: "M365-QSCX4-LM6PR-WNGT1-EJ2YD", usageVolume: 1 },
    ],
  },
  {
    name: "Adobe Creative Cloud",
    description: "Full access to all Adobe apps including Photoshop, Illustrator, Premiere Pro, and Acrobat.",
    requiresApproval: true,
    maxLicensesPerUser: 1,
    licenses: [
      { key: "ADB-7X2K-P9MR-4NHQ-C3BL", usageVolume: 1 },
      { key: "ADB-5TGV-W8JF-2YDS-R6NP", usageVolume: 1 },
      { key: "ADB-1BWZ-K4HC-9XMT-D7QJ", usageVolume: 1 },
    ],
  },
  {
    name: "JetBrains All Products Pack",
    description: "Unlimited access to all JetBrains IDEs including IntelliJ IDEA, WebStorm, PyCharm, and DataGrip.",
    requiresApproval: true,
    maxLicensesPerUser: 1,
    licenses: [
      { key: "JB-K7X2MP9R-4NHQ3CBL5", usageVolume: 1 },
      { key: "JB-T5GVW8JF-2YDS6RNP1", usageVolume: 1 },
      { key: "JB-B1WZK4HC-9XMT7DQJ2", usageVolume: 1 },
      { key: "JB-F3YNQ6SX-8VJP2KTM4", usageVolume: 1 },
    ],
  },
  {
    name: "GitHub Copilot",
    description: "AI-powered code completion and chat assistant integrated into your editor.",
    requiresApproval: false,
    maxLicensesPerUser: 1,
    licenses: [
      { key: "GHC-4KXRM2-N7BPWQ-T9FDJY", usageVolume: 1 },
      { key: "GHC-8ZVCT6-W3HNPK-M5RJQL", usageVolume: 1 },
      { key: "GHC-2TYNB5-X9KQFJ-P4WVZM", usageVolume: 1 },
      { key: "GHC-6FMPJD-Q1VKXN-R8ZCWT", usageVolume: 1 },
      { key: "GHC-9DQRWB-K7MZNP-J3YXFT", usageVolume: 1 },
    ],
  },
  {
    name: "Figma Professional",
    description: "Collaborative interface design tool for UI/UX design, prototyping, and developer handoff.",
    requiresApproval: false,
    maxLicensesPerUser: 1,
    licenses: [
      { key: "FIG-HQ7K-3NRX-BPMC-Z2WJ", usageVolume: 1 },
      { key: "FIG-DV4T-8YFN-GWQZ-K6LP", usageVolume: 1 },
      { key: "FIG-XM9R-2BCS-FPJD-N5TK", usageVolume: 1 },
      { key: "FIG-WP3Q-7ZKN-RXHB-Y1MV", usageVolume: 1 },
    ],
  },
  {
    name: "Slack Business+",
    description: "Team messaging platform with unlimited message history, workflow automation, and compliance tools.",
    requiresApproval: false,
    maxLicensesPerUser: 1,
    licenses: [{ key: "SLK-TEAM-ENT-2024-XKQR7BMNPZ", usageVolume: 50 }],
  },
  {
    name: "Zoom Workplace",
    description: "Video conferencing, webinars, and team chat with AI Companion and 1000-attendee capacity.",
    requiresApproval: false,
    maxLicensesPerUser: 1,
    licenses: [{ key: "ZM-WP-9FJTK-2BXQRN-7DMYVC", usageVolume: 25 }],
  },
];

// ---------------------------------------------------------------------------
// Assignments: which employee gets which license key
// ---------------------------------------------------------------------------

const ASSIGNMENTS: { email: string; productName: string; licenseKey: string }[] = [
  // Sarah Johnson
  { email: "sarah.johnson@company.com", productName: "Microsoft 365", licenseKey: "M365-TXKQP-7H2RN-BVCJ4-WY9DM" },
  {
    email: "sarah.johnson@company.com",
    productName: "JetBrains All Products Pack",
    licenseKey: "JB-K7X2MP9R-4NHQ3CBL5",
  },
  { email: "sarah.johnson@company.com", productName: "GitHub Copilot", licenseKey: "GHC-4KXRM2-N7BPWQ-T9FDJY" },
  { email: "sarah.johnson@company.com", productName: "Slack Business+", licenseKey: "SLK-TEAM-ENT-2024-XKQR7BMNPZ" },
  { email: "sarah.johnson@company.com", productName: "Zoom Workplace", licenseKey: "ZM-WP-9FJTK-2BXQRN-7DMYVC" },

  // Marcus Chen
  { email: "marcus.chen@company.com", productName: "Microsoft 365", licenseKey: "M365-RPLJ8-KD4NX-CFMQ3-SZ7WB" },
  { email: "marcus.chen@company.com", productName: "Adobe Creative Cloud", licenseKey: "ADB-7X2K-P9MR-4NHQ-C3BL" },
  { email: "marcus.chen@company.com", productName: "GitHub Copilot", licenseKey: "GHC-8ZVCT6-W3HNPK-M5RJQL" },
  { email: "marcus.chen@company.com", productName: "Slack Business+", licenseKey: "SLK-TEAM-ENT-2024-XKQR7BMNPZ" },
  { email: "marcus.chen@company.com", productName: "Zoom Workplace", licenseKey: "ZM-WP-9FJTK-2BXQRN-7DMYVC" },

  // Priya Patel
  { email: "priya.patel@company.com", productName: "Microsoft 365", licenseKey: "M365-GNVH6-2YT9A-XMPKE-QR1CL" },
  { email: "priya.patel@company.com", productName: "Figma Professional", licenseKey: "FIG-HQ7K-3NRX-BPMC-Z2WJ" },
  { email: "priya.patel@company.com", productName: "Slack Business+", licenseKey: "SLK-TEAM-ENT-2024-XKQR7BMNPZ" },
];

// ---------------------------------------------------------------------------
// License requests (approval-required products only)
// ---------------------------------------------------------------------------

const REQUESTS: {
  email: string;
  productName: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}[] = [
  // Approved requests — matching the assignments above
  { email: "sarah.johnson@company.com", productName: "JetBrains All Products Pack", status: "approved" },
  { email: "marcus.chen@company.com", productName: "Adobe Creative Cloud", status: "approved" },
  // Pending requests
  { email: "sarah.johnson@company.com", productName: "Adobe Creative Cloud", status: "pending" },
  { email: "priya.patel@company.com", productName: "Adobe Creative Cloud", status: "pending" },
  // Rejected requests
  {
    email: "priya.patel@company.com",
    productName: "JetBrains All Products Pack",
    status: "rejected",
    rejectionReason: "JetBrains IDEs are currently only available to the backend engineering team.",
  },
  {
    email: "marcus.chen@company.com",
    productName: "JetBrains All Products Pack",
    status: "rejected",
    rejectionReason:
      "Your team already uses VS Code with Copilot. Please check with your team lead before requesting additional IDEs.",
  },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

// Returns a Date n days ago with a random minute offset for realism
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

async function seed() {
  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log("── Users ────────────────────────────────────");
  const hashedPassword = await hashPassword(DEMO_PASSWORD);
  const newlyAddedUserEmails: string[] = [];

  for (const demo of DEMO_USERS) {
    const [existing] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(or(eq(userTable.email, demo.email), eq(userTable.id, demo.id)));
    if (existing) {
      console.log(`  skip    ${demo.role === "admin" ? "admin   " : "employee"} ${demo.email}`);
      continue;
    }
    await db.insert(userTable).values({
      id: demo.id,
      name: demo.name,
      email: demo.email,
      emailVerified: true,
      role: demo.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await db.insert(account).values({
      id: `${demo.id}-account`,
      accountId: demo.id,
      providerId: "credential",
      userId: demo.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    newlyAddedUserEmails.push(demo.email);
    console.log(`  added   ${demo.role === "admin" ? "admin   " : "employee"} ${demo.email}`);
  }

  // Build email → { id, name } map (handles users seeded with old IDs)
  const userRows = await db.select({ id: userTable.id, email: userTable.email, name: userTable.name }).from(userTable);
  const userByEmail = new Map(userRows.map((u) => [u.email, { id: u.id, name: u.name }]));

  const adminId = userByEmail.get("emily.rodriguez@company.com")?.id ?? "demo-admin-1";
  const adminName = userByEmail.get("emily.rodriguez@company.com")?.name ?? "Emily Rodriguez";
  const davidId = userByEmail.get("david.kim@company.com")?.id ?? "demo-admin-2";
  const davidName = userByEmail.get("david.kim@company.com")?.name ?? "David Kim";

  // Audit: user.invited for each newly added user (admins invited employees ~7 weeks ago)
  for (let i = 0; i < newlyAddedUserEmails.length; i++) {
    const email = newlyAddedUserEmails[i];
    const u = userByEmail.get(email!);
    if (!u) continue;
    const actor = i % 2 === 0 ? { id: adminId, name: adminName } : { id: davidId, name: davidName };
    await db.insert(auditLog).values({
      userId: actor.id,
      userName: actor.name,
      action: "user.invited",
      entityType: "invite",
      entityId: u.id,
      metadata: { invitedEmail: email },
      createdAt: daysAgo(49 - i),
    });
  }

  // ── 2. Products & licenses ────────────────────────────────────────────────
  console.log("\n── Products & licenses ──────────────────────");
  const productIdByName = new Map<string, string>();
  const licenseIdByKey = new Map<string, string>(); // "productName::key" → licenseId

  for (let pi = 0; pi < DEMO_PRODUCTS.length; pi++) {
    const p = DEMO_PRODUCTS[pi]!;
    const [existing] = await db.select().from(product).where(eq(product.name, p.name));
    let productId: string;

    if (existing) {
      console.log(`  skip    ${p.name}`);
      productId = existing.id;
    } else {
      const [created] = await db
        .insert(product)
        .values({
          name: p.name,
          description: p.description,
          requiresApproval: p.requiresApproval,
          maxLicensesPerUser: p.maxLicensesPerUser,
        })
        .returning({ id: product.id });
      productId = created.id;
      const actor = pi % 2 === 0 ? { id: adminId, name: adminName } : { id: davidId, name: davidName };
      await db.insert(auditLog).values({
        userId: actor.id,
        userName: actor.name,
        action: "product.created",
        entityType: "product",
        entityId: productId,
        metadata: { productName: p.name },
        createdAt: daysAgo(60 - pi),
      });
      console.log(`  added   ${p.name}`);
    }
    productIdByName.set(p.name, productId);

    let licIdx = 0;
    for (const lic of p.licenses) {
      const [existingLic] = await db
        .select()
        .from(license)
        .where(and(eq(license.key, lic.key), eq(license.productId, productId)));

      let licenseId: string;
      if (existingLic) {
        licenseId = existingLic.id;
      } else {
        const [created] = await db
          .insert(license)
          .values({ key: lic.key, usageVolume: lic.usageVolume, productId })
          .returning({ id: license.id });
        licenseId = created.id;
        const actor = licIdx % 2 === 0 ? { id: adminId, name: adminName } : { id: davidId, name: davidName };
        await db.insert(auditLog).values({
          userId: actor.id,
          userName: actor.name,
          action: "license.created",
          entityType: "license",
          entityId: licenseId,
          metadata: { productName: p.name },
          createdAt: daysAgo(59 - pi - licIdx),
        });
        console.log(`    added   ${lic.key}`);
      }
      licenseIdByKey.set(`${p.name}::${lic.key}`, licenseId);
      licIdx++;
    }
  }

  // ── 3. Assignments ────────────────────────────────────────────────────────
  console.log("\n── Assignments ──────────────────────────────");
  for (let ai = 0; ai < ASSIGNMENTS.length; ai++) {
    const a = ASSIGNMENTS[ai]!;
    const user = userByEmail.get(a.email);
    const licenseId = licenseIdByKey.get(`${a.productName}::${a.licenseKey}`);

    if (!user || !licenseId) {
      console.log(`  skip    ${a.email} → ${a.licenseKey} (missing user or license)`);
      continue;
    }

    const [existing] = await db
      .select()
      .from(licenseUser)
      .where(and(eq(licenseUser.licenseId, licenseId), eq(licenseUser.userId, user.id)));

    if (existing) {
      console.log(`  skip    ${a.email} → ${a.productName}`);
    } else {
      await db.insert(licenseUser).values({ licenseId, userId: user.id });
      const actor = ai % 2 === 0 ? { id: adminId, name: adminName } : { id: davidId, name: davidName };
      await db.insert(auditLog).values({
        userId: actor.id,
        userName: actor.name,
        action: "license.user_assigned",
        entityType: "license",
        entityId: licenseId,
        metadata: { assignedUserId: user.id, assignedUserName: user.name, productName: a.productName },
        createdAt: daysAgo(35 - ai),
      });
      console.log(`  assigned ${a.email} → ${a.productName}`);
    }
  }

  // ── 4. License requests ───────────────────────────────────────────────────
  console.log("\n── License requests ─────────────────────────");
  for (let ri = 0; ri < REQUESTS.length; ri++) {
    const r = REQUESTS[ri]!;
    const user = userByEmail.get(r.email);
    const productId = productIdByName.get(r.productName);

    if (!user || !productId) {
      console.log(`  skip    ${r.email} → ${r.productName} (missing user or product)`);
      continue;
    }

    const [existing] = await db
      .select()
      .from(licenseRequest)
      .where(
        and(
          eq(licenseRequest.userId, user.id),
          eq(licenseRequest.productId, productId),
          eq(licenseRequest.status, r.status),
        ),
      );

    if (existing) {
      console.log(`  skip    ${r.email} → ${r.productName} (${r.status})`);
    } else {
      const [created] = await db
        .insert(licenseRequest)
        .values({ userId: user.id, productId, status: r.status, rejectionReason: r.rejectionReason ?? null })
        .returning({ id: licenseRequest.id });
      const submittedAt = daysAgo(28 - ri * 2);
      await db.insert(auditLog).values({
        userId: user.id,
        userName: user.name,
        action: "license_request.submitted",
        entityType: "license_request",
        entityId: created.id,
        metadata: { productName: r.productName, productId },
        createdAt: submittedAt,
      });
      if (r.status === "approved") {
        const actor = ri % 2 === 0 ? { id: adminId, name: adminName } : { id: davidId, name: davidName };
        await db.insert(auditLog).values({
          userId: actor.id,
          userName: actor.name,
          action: "license_request.approved",
          entityType: "license_request",
          entityId: created.id,
          metadata: { productName: r.productName, requestedBy: user.name },
          createdAt: daysAgo(25 - ri * 2),
        });
      } else if (r.status === "rejected") {
        const actor = ri % 2 === 0 ? { id: adminId, name: adminName } : { id: davidId, name: davidName };
        await db.insert(auditLog).values({
          userId: actor.id,
          userName: actor.name,
          action: "license_request.rejected",
          entityType: "license_request",
          entityId: created.id,
          metadata: { productName: r.productName, requestedBy: user.name, reason: r.rejectionReason },
          createdAt: daysAgo(25 - ri * 2),
        });
      }
      console.log(`  added   ${r.email} → ${r.productName} (${r.status})`);
    }
  }

  console.log(`\n── Done ─────────────────────────────────────`);
  console.log(`   Password for all demo accounts: ${DEMO_PASSWORD}`);
  console.log(`   Employees : sarah.johnson@company.com`);
  console.log(`             : marcus.chen@company.com`);
  console.log(`             : priya.patel@company.com`);
  console.log(`   Admins    : emily.rodriguez@company.com`);
  console.log(`             : david.kim@company.com`);

  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
