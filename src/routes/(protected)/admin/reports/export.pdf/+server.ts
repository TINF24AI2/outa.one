import { and, count, desc, eq, gte, ilike, inArray, lte, sql, type SQL } from "drizzle-orm";
import PDFDocument from "pdfkit";

import { requireAdminUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { auditLog, license, product } from "$lib/server/db/schema";

import type { RequestHandler } from "./$types";

const ACTION_LABELS: Record<string, string> = {
  "license.created": "License Created",
  "license.deleted": "License Deleted",
  "license.user_assigned": "License Assigned",
  "license.user_unassigned": "License Unassigned",
  "product.created": "Product Created",
  "product.updated": "Product Updated",
  "product.deleted": "Product Deleted",
  "user.invited": "User Invited",
  "user.invite_resent": "Invite Resent",
  "user.invite_cancelled": "Invite Cancelled",
  "user.role_updated": "Role Updated",
  "user.removed": "User Removed",
  "license_request.submitted": "Request Submitted",
  "license_request.approved": "Request Approved",
  "license_request.rejected": "Request Rejected",
};

export const GET: RequestHandler = async (event) => {
  requireAdminUser(event);

  const productId = event.url.searchParams.get("productId") ?? null;
  const userSearch = event.url.searchParams.get("userSearch") ?? null;
  const dateFrom = event.url.searchParams.get("dateFrom") ?? null;
  const dateTo = event.url.searchParams.get("dateTo") ?? null;

  const conditions: SQL[] = [];
  if (dateFrom) conditions.push(gte(auditLog.createdAt, new Date(dateFrom)));
  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(auditLog.createdAt, toDate));
  }
  if (userSearch) conditions.push(ilike(auditLog.userName, `%${userSearch}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [chartRows, rows] = await Promise.all([
    db
      .select({ productName: product.name, count: count() })
      .from(auditLog)
      .innerJoin(license, and(sql`${auditLog.entityId}::uuid = ${license.id}`, eq(auditLog.entityType, "license")))
      .innerJoin(product, eq(license.productId, product.id))
      .where(eq(auditLog.action, "license.user_assigned"))
      .groupBy(product.name)
      .orderBy(desc(count())),

    db
      .select({
        id: auditLog.id,
        createdAt: auditLog.createdAt,
        userName: auditLog.userName,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
      })
      .from(auditLog)
      .where(where)
      .orderBy(desc(auditLog.createdAt))
      .limit(10000),
  ]);

  const licenseEntityIds = [
    ...new Set(rows.filter((r) => r.entityType === "license" && r.entityId).map((r) => r.entityId!)),
  ];

  const licenseDetails =
    licenseEntityIds.length > 0
      ? await db
          .select({ id: license.id, productName: product.name, productId: license.productId })
          .from(license)
          .leftJoin(product, eq(license.productId, product.id))
          .where(inArray(license.id, licenseEntityIds))
      : [];

  const licenseMap = new Map(licenseDetails.map((l) => [l.id, l]));

  let enriched = rows.map((row) => {
    const lic = row.entityType === "license" && row.entityId ? licenseMap.get(row.entityId) : undefined;
    return { ...row, productName: lic?.productName ?? null };
  });

  if (productId) {
    const licenseRows = await db.select({ id: license.id }).from(license).where(eq(license.productId, productId));
    const ids = new Set(licenseRows.map((r) => r.id));
    enriched = enriched.filter((r) => r.entityId && ids.has(r.entityId));
  }

  let filterProductName: string | null = null;
  if (productId) {
    const [prod] = await db.select({ name: product.name }).from(product).where(eq(product.id, productId));
    filterProductName = prod?.name ?? null;
  }

  // Layout constants (A4: 595 × 841 pt, 50pt margins → 495pt usable width)
  const MARGIN = 50;
  const PAGE_W = 495;
  const ROW_H = 26; // taller row to fit two-line timestamp
  const HEADER_H = 22;

  // Table column layout: Timestamp | User | Product | Action
  // Timestamp uses two lines (date + time), so its column can be narrower
  const COL_X = [MARGIN, MARGIN + 88, MARGIN + 208, MARGIN + 348] as const;
  const COL_W = [84, 116, 136, 147] as const;

  const C = {
    blue: "#3b82f6",
    gray: "#6b7280",
    dark: "#374151",
    light: "#f3f4f6",
    stripe: "#f9fafb",
    border: "#e5e7eb",
  };

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, autoFirstPage: true });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = MARGIN;

    // ── Header ──────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(22).fillColor(C.dark).text("License Activity Report", MARGIN, y);
    y += 30;

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(C.gray)
      .text(`Generated: ${new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}`, MARGIN, y, {
        lineBreak: false,
      });

    const hasFilters = !!(productId || userSearch || dateFrom || dateTo);
    if (hasFilters) {
      const parts: string[] = [];
      if (filterProductName) parts.push(`Product: ${filterProductName}`);
      if (userSearch) parts.push(`User: ${userSearch}`);
      if (dateFrom) parts.push(`From: ${dateFrom}`);
      if (dateTo) parts.push(`To: ${dateTo}`);
      y += 16;
      doc
        .fontSize(10)
        .fillColor(C.gray)
        .text(`Filters: ${parts.join("  ·  ")}`, MARGIN, y, { lineBreak: false });
    }

    y += 18;
    doc
      .moveTo(MARGIN, y)
      .lineTo(MARGIN + PAGE_W, y)
      .strokeColor(C.border)
      .lineWidth(0.5)
      .stroke();
    y += 14;

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(C.gray)
      .text(`Total records: ${enriched.length}`, MARGIN, y, { lineBreak: false });
    y += 24;

    // ── Bar Chart ────────────────────────────────────────────────────────────
    if (chartRows.length > 0) {
      doc.font("Helvetica-Bold").fontSize(11).fillColor(C.dark).text("License Assignments by Product", MARGIN, y);
      y += 18;

      const maxCount = Math.max(...chartRows.map((r) => r.count), 1);
      const labelW = 130;
      const barAreaW = PAGE_W - labelW - 32;
      const barH = 14;

      for (const row of chartRows) {
        const barW = Math.max(2, (row.count / maxCount) * barAreaW);
        const barX = MARGIN + labelW;

        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(C.gray)
          .text(row.productName, MARGIN, y + 2, { width: labelW - 8, lineBreak: false });

        doc.rect(barX, y, barAreaW, barH).fillColor(C.light).fill();
        doc.rect(barX, y, barW, barH).fillColor(C.blue).fill();

        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor(C.dark)
          .text(String(row.count), barX + barW + 5, y + 2, { lineBreak: false });

        y += barH + 6;
      }
      y += 14;
    }

    // ── Activity Log ─────────────────────────────────────────────────────────
    doc
      .moveTo(MARGIN, y)
      .lineTo(MARGIN + PAGE_W, y)
      .strokeColor(C.border)
      .lineWidth(0.5)
      .stroke();
    y += 12;

    doc.font("Helvetica-Bold").fontSize(11).fillColor(C.dark).text("Activity Log", MARGIN, y);
    y += 16;

    function drawTableHeader(yPos: number): number {
      doc.rect(MARGIN, yPos, PAGE_W, HEADER_H).fillColor(C.light).fill();
      const headers = ["Timestamp", "User", "Product", "Action"];
      doc.font("Helvetica-Bold").fontSize(9).fillColor(C.dark);
      for (let i = 0; i < headers.length; i++) {
        doc.text(headers[i]!, COL_X[i]! + 4, yPos + 7, { width: COL_W[i]! - 8, lineBreak: false });
      }
      return yPos + HEADER_H;
    }

    y = drawTableHeader(y);

    if (enriched.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(C.gray)
        .text("No records found.", MARGIN + 4, y + 10);
    } else {
      let rowIndex = 0;
      for (const row of enriched) {
        if (y + ROW_H > doc.page.height - MARGIN) {
          doc.addPage();
          y = MARGIN;
          y = drawTableHeader(y);
          rowIndex = 0;
        }

        if (rowIndex % 2 === 1) {
          doc.rect(MARGIN, y, PAGE_W, ROW_H).fillColor(C.stripe).fill();
        }

        const d = row.createdAt;
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        // Timestamp: date on line 1, time smaller below
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(C.gray)
          .text(dateStr, COL_X[0]! + 4, y + 5, { width: COL_W[0]! - 8, lineBreak: false });
        doc.fontSize(8).text(timeStr, COL_X[0]! + 4, y + 15, { width: COL_W[0]! - 8, lineBreak: false });

        // Other cells — vertically centered in the taller row
        doc
          .fontSize(9)
          .fillColor(C.dark)
          .text(row.userName, COL_X[1]! + 4, y + 9, { width: COL_W[1]! - 8, lineBreak: false });
        doc
          .fillColor(C.gray)
          .text(row.productName ?? "—", COL_X[2]! + 4, y + 9, { width: COL_W[2]! - 8, lineBreak: false });
        doc.fillColor(C.dark).text(ACTION_LABELS[row.action] ?? row.action, COL_X[3]! + 4, y + 9, {
          width: COL_W[3]! - 8,
          lineBreak: false,
        });

        y += ROW_H;
        rowIndex++;
      }
    }

    doc.end();
  });

  const filename = `license-activity-${new Date().toISOString().split("T")[0]}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
};
