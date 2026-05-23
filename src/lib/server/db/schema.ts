import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth.schema";
import { defineTableWithUpdate } from "./utils/table-factory";

export const task = pgTable("task", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  priority: integer("priority").notNull().default(1),
});

export const product = defineTableWithUpdate("product", {
  name: text("name").notNull(),
  description: text("description"),
  requiresApproval: boolean("requiresApproval").notNull().default(false),
  maxLicensesPerUser: integer("maxLicensesPerUser").notNull().default(1),
});

export const productRelations = relations(product, ({ many }) => ({
  licenses: many(license),
  licenseRequests: many(licenseRequest),
}));

export const license = defineTableWithUpdate(
  "license",
  {
    key: text("key").notNull(),
    usageVolume: integer("usageVolume").notNull(),
    productId: uuid()
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
  },
  (table) => [unique().on(table.productId, table.key), index("license_productId_idx").on(table.productId)],
);

export const licenseRelations = relations(license, ({ one, many }) => ({
  product: one(product, {
    fields: [license.productId],
    references: [product.id],
  }),
  assignedUsers: many(licenseUser),
}));

export const licenseUser = pgTable(
  "license_user",
  {
    licenseId: uuid("license_id")
      .notNull()
      .references(() => license.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.licenseId, table.userId] }),
    index("license_user_user_id_idx").on(table.userId),
  ],
);

export const licenseUserRelations = relations(licenseUser, ({ one }) => ({
  license: one(license, { fields: [licenseUser.licenseId], references: [license.id] }),
  user: one(user, { fields: [licenseUser.userId], references: [user.id] }),
}));

export const userLicenseRelations = relations(user, ({ many }) => ({
  licenseAssignments: many(licenseUser),
  licenseRequests: many(licenseRequest),
}));

export const licenseRequestStatusEnum = pgEnum("license_request_status", ["pending", "approved", "rejected"]);

export const licenseRequest = defineTableWithUpdate(
  "license_request",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    status: licenseRequestStatusEnum("status").notNull().default("pending"),
  },
  (table) => [
    index("license_request_user_id_idx").on(table.userId),
    index("license_request_product_id_idx").on(table.productId),
  ],
);

export const licenseRequestRelations = relations(licenseRequest, ({ one }) => ({
  user: one(user, { fields: [licenseRequest.userId], references: [user.id] }),
  product: one(product, { fields: [licenseRequest.productId], references: [product.id] }),
}));

export * from "./auth.schema";
