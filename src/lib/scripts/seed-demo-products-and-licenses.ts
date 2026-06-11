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
// Assignments
// ---------------------------------------------------------------------------

const ASSIGNMENTS: {
  email: string;
  productName: string;
  licenseKey: string;
  selfService: boolean; // true = employee obtained it directly, false = admin assigned after approval
}[] = [
  // Sarah Johnson — developer, grabbed common tools herself; JetBrains was approved
  {
    email: "sarah.johnson@company.com",
    productName: "Microsoft 365",
    licenseKey: "M365-TXKQP-7H2RN-BVCJ4-WY9DM",
    selfService: true,
  },
  {
    email: "sarah.johnson@company.com",
    productName: "JetBrains All Products Pack",
    licenseKey: "JB-K7X2MP9R-4NHQ3CBL5",
    selfService: false,
  },
  {
    email: "sarah.johnson@company.com",
    productName: "GitHub Copilot",
    licenseKey: "GHC-4KXRM2-N7BPWQ-T9FDJY",
    selfService: true,
  },
  {
    email: "sarah.johnson@company.com",
    productName: "Slack Business+",
    licenseKey: "SLK-TEAM-ENT-2024-XKQR7BMNPZ",
    selfService: true,
  },
  {
    email: "sarah.johnson@company.com",
    productName: "Zoom Workplace",
    licenseKey: "ZM-WP-9FJTK-2BXQRN-7DMYVC",
    selfService: true,
  },

  // Marcus Chen — designer/developer hybrid; Adobe was approved
  {
    email: "marcus.chen@company.com",
    productName: "Microsoft 365",
    licenseKey: "M365-RPLJ8-KD4NX-CFMQ3-SZ7WB",
    selfService: true,
  },
  {
    email: "marcus.chen@company.com",
    productName: "Adobe Creative Cloud",
    licenseKey: "ADB-7X2K-P9MR-4NHQ-C3BL",
    selfService: false,
  },
  {
    email: "marcus.chen@company.com",
    productName: "GitHub Copilot",
    licenseKey: "GHC-8ZVCT6-W3HNPK-M5RJQL",
    selfService: true,
  },
  {
    email: "marcus.chen@company.com",
    productName: "Figma Professional",
    licenseKey: "FIG-DV4T-8YFN-GWQZ-K6LP",
    selfService: true,
  },
  {
    email: "marcus.chen@company.com",
    productName: "Slack Business+",
    licenseKey: "SLK-TEAM-ENT-2024-XKQR7BMNPZ",
    selfService: true,
  },
  {
    email: "marcus.chen@company.com",
    productName: "Zoom Workplace",
    licenseKey: "ZM-WP-9FJTK-2BXQRN-7DMYVC",
    selfService: true,
  },

  // Priya Patel — product/UX focus
  {
    email: "priya.patel@company.com",
    productName: "Microsoft 365",
    licenseKey: "M365-GNVH6-2YT9A-XMPKE-QR1CL",
    selfService: true,
  },
  {
    email: "priya.patel@company.com",
    productName: "Figma Professional",
    licenseKey: "FIG-HQ7K-3NRX-BPMC-Z2WJ",
    selfService: true,
  },
  {
    email: "priya.patel@company.com",
    productName: "Slack Business+",
    licenseKey: "SLK-TEAM-ENT-2024-XKQR7BMNPZ",
    selfService: true,
  },
  {
    email: "priya.patel@company.com",
    productName: "Zoom Workplace",
    licenseKey: "ZM-WP-9FJTK-2BXQRN-7DMYVC",
    selfService: true,
  },
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
  // Approved — matching assignments above
  { email: "sarah.johnson@company.com", productName: "JetBrains All Products Pack", status: "approved" },
  { email: "marcus.chen@company.com", productName: "Adobe Creative Cloud", status: "approved" },
  // Pending
  { email: "sarah.johnson@company.com", productName: "Adobe Creative Cloud", status: "pending" },
  { email: "priya.patel@company.com", productName: "Adobe Creative Cloud", status: "pending" },
  // Rejected
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
// Helpers
// ---------------------------------------------------------------------------

// Returns a Date at a realistic work-hour time the given number of days ago.
// Spreads events across 09:00–18:00; jitter keeps consecutive events distinct.
let _jitter = 0;
function workTs(daysAgo: number, hourOffset = 0): Date {
  _jitter = (_jitter + 7) % 53; // deterministic but non-repeating minute offset
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(9 + hourOffset, _jitter, Math.floor(_jitter / 2), 0);
  return d;
}

const OFFICE_IPS = [
  "10.0.1.42",
  "10.0.1.17",
  "10.0.1.88",
  "10.0.1.55",
  "10.0.1.103",
  "10.0.1.71",
  "10.0.1.29",
  "10.0.1.64",
];
const REMOTE_IPS = ["85.214.132.117", "176.9.24.58", "78.46.91.203", "95.216.14.72", "46.4.68.139", "135.181.55.34"];
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
];

// Deterministic picks so the output is consistent across re-runs.
let _pick = 0;
function pick<T>(arr: T[]): T {
  return arr[_pick++ % arr.length]!;
}

function officeIp() {
  return pick(OFFICE_IPS);
}
function remoteIp() {
  return pick(REMOTE_IPS);
}
function ua() {
  return pick(USER_AGENTS);
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

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

  // Build email → { id, name } map
  const userRows = await db.select({ id: userTable.id, email: userTable.email, name: userTable.name }).from(userTable);
  const userByEmail = new Map(userRows.map((u) => [u.email, { id: u.id, name: u.name }]));

  const emily = {
    id: userByEmail.get("emily.rodriguez@company.com")?.id ?? "demo-admin-1",
    name: userByEmail.get("emily.rodriguez@company.com")?.name ?? "Emily Rodriguez",
  };
  const david = {
    id: userByEmail.get("david.kim@company.com")?.id ?? "demo-admin-2",
    name: userByEmail.get("david.kim@company.com")?.name ?? "David Kim",
  };

  // Audit: user.invited — admins sent invites ~7 weeks ago, a few days apart
  for (let i = 0; i < newlyAddedUserEmails.length; i++) {
    const email = newlyAddedUserEmails[i]!;
    const u = userByEmail.get(email);
    if (!u) continue;
    const actor = i % 2 === 0 ? emily : david;
    await db.insert(auditLog).values({
      userId: actor.id,
      userName: actor.name,
      action: "user.invited",
      entityType: "invite",
      entityId: u.id,
      metadata: { invitedEmail: email, invitedName: u.name },
      ipAddress: officeIp(),
      userAgent: ua(),
      createdAt: workTs(49 - i, 1),
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
      productId = created!.id;
      const actor = pi % 2 === 0 ? emily : david;
      await db.insert(auditLog).values({
        userId: actor.id,
        userName: actor.name,
        action: "product.created",
        entityType: "product",
        entityId: productId,
        metadata: { productName: p.name },
        ipAddress: officeIp(),
        userAgent: ua(),
        createdAt: workTs(60 - pi, 2),
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
        licenseId = created!.id;
        const actor = licIdx % 2 === 0 ? emily : david;
        await db.insert(auditLog).values({
          userId: actor.id,
          userName: actor.name,
          action: "license.created",
          entityType: "license",
          entityId: licenseId,
          metadata: { productName: p.name, licenseKey: lic.key },
          ipAddress: officeIp(),
          userAgent: ua(),
          createdAt: workTs(59 - pi, 2 + licIdx),
        });
        console.log(`    added   ${lic.key}`);
      }
      licenseIdByKey.set(`${p.name}::${lic.key}`, licenseId);
      licIdx++;
    }
  }

  // Admin tweaked JetBrains approval setting a week after initial upload
  const jetbrainsId = productIdByName.get("JetBrains All Products Pack");
  if (jetbrainsId) {
    await db.insert(auditLog).values({
      userId: emily.id,
      userName: emily.name,
      action: "product.updated",
      entityType: "product",
      entityId: jetbrainsId,
      metadata: {
        productName: "JetBrains All Products Pack",
        field: "requiresApproval",
        oldValue: "false",
        newValue: "true",
      },
      ipAddress: officeIp(),
      userAgent: ua(),
      createdAt: workTs(52, 3),
    });
  }

  // ── 3. Assignments ────────────────────────────────────────────────────────
  console.log("\n── Assignments ──────────────────────────────");

  // Timestamps spread across days 35 → 10, earliest first, work hours
  const assignmentDays = [35, 34, 33, 31, 30, 29, 28, 27, 26, 24, 22, 20, 18, 16, 14];

  for (let ai = 0; ai < ASSIGNMENTS.length; ai++) {
    const a = ASSIGNMENTS[ai]!;
    const u = userByEmail.get(a.email);
    const licenseId = licenseIdByKey.get(`${a.productName}::${a.licenseKey}`);
    const productId = productIdByName.get(a.productName);

    if (!u || !licenseId || !productId) {
      console.log(`  skip    ${a.email} → ${a.licenseKey} (missing data)`);
      continue;
    }

    const [existing] = await db
      .select()
      .from(licenseUser)
      .where(and(eq(licenseUser.licenseId, licenseId), eq(licenseUser.userId, u.id)));

    if (existing) {
      console.log(`  skip    ${a.email} → ${a.productName}`);
    } else {
      await db.insert(licenseUser).values({ licenseId, userId: u.id });

      // Self-service: the employee is the actor; approval: admin is the actor
      const actor = a.selfService ? u : ai % 2 === 0 ? emily : david;
      const ip = a.selfService ? (ai % 4 === 0 ? remoteIp() : officeIp()) : officeIp();
      const daysBack = assignmentDays[ai % assignmentDays.length]!;

      await db.insert(auditLog).values({
        userId: actor.id,
        userName: actor.name,
        action: "license.user_assigned",
        entityType: "license",
        entityId: licenseId,
        metadata: {
          targetUserId: u.id,
          targetUserName: u.name,
          productId,
          productName: a.productName,
          licenseKey: a.licenseKey,
        },
        ipAddress: ip,
        userAgent: ua(),
        createdAt: workTs(daysBack, ai % 7),
      });
      console.log(`  assigned ${a.email} → ${a.productName}`);
    }
  }

  // ── 4. License requests ───────────────────────────────────────────────────
  console.log("\n── License requests ─────────────────────────");

  // Request days: submitted several days before any admin action
  const requestDays = [32, 29, 15, 12, 38, 36];
  const reviewOffsets = [3, 2, 0, 0, 2, 1]; // days after submission until admin reviewed

  for (let ri = 0; ri < REQUESTS.length; ri++) {
    const r = REQUESTS[ri]!;
    const u = userByEmail.get(r.email);
    const productId = productIdByName.get(r.productName);

    if (!u || !productId) {
      console.log(`  skip    ${r.email} → ${r.productName} (missing data)`);
      continue;
    }

    const [existing] = await db
      .select()
      .from(licenseRequest)
      .where(
        and(
          eq(licenseRequest.userId, u.id),
          eq(licenseRequest.productId, productId),
          eq(licenseRequest.status, r.status),
        ),
      );

    if (existing) {
      console.log(`  skip    ${r.email} → ${r.productName} (${r.status})`);
      continue;
    }

    const [created] = await db
      .insert(licenseRequest)
      .values({ userId: u.id, productId, status: r.status, rejectionReason: r.rejectionReason ?? null })
      .returning({ id: licenseRequest.id });

    const submittedDaysAgo = requestDays[ri]!;
    const reviewedDaysAgo = submittedDaysAgo - reviewOffsets[ri]!;

    await db.insert(auditLog).values({
      userId: u.id,
      userName: u.name,
      action: "license_request.submitted",
      entityType: "license_request",
      entityId: created!.id,
      metadata: { targetUserId: u.id, productId, productName: r.productName },
      ipAddress: ri % 3 === 0 ? remoteIp() : officeIp(),
      userAgent: ua(),
      createdAt: workTs(submittedDaysAgo, 1),
    });

    if (r.status === "approved") {
      const actor = ri % 2 === 0 ? emily : david;
      await db.insert(auditLog).values({
        userId: actor.id,
        userName: actor.name,
        action: "license_request.approved",
        entityType: "license_request",
        entityId: created!.id,
        metadata: { targetUserId: u.id, targetUserName: u.name, productId, productName: r.productName },
        ipAddress: officeIp(),
        userAgent: ua(),
        createdAt: workTs(reviewedDaysAgo, 4),
      });
    } else if (r.status === "rejected") {
      const actor = ri % 2 === 0 ? emily : david;
      await db.insert(auditLog).values({
        userId: actor.id,
        userName: actor.name,
        action: "license_request.rejected",
        entityType: "license_request",
        entityId: created!.id,
        metadata: {
          targetUserId: u.id,
          targetUserName: u.name,
          productId,
          productName: r.productName,
          rejectionReason: r.rejectionReason,
        },
        ipAddress: officeIp(),
        userAgent: ua(),
        createdAt: workTs(reviewedDaysAgo, 4),
      });
    }

    console.log(`  added   ${r.email} → ${r.productName} (${r.status})`);
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
