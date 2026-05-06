import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, uuid } from 'drizzle-orm/pg-core';
import { defineTableWithUpdate } from './utils/table-factory';

export const task = pgTable('task', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  priority: integer('priority').notNull().default(1),
});

export const product = defineTableWithUpdate('product', {
  name: text('name').notNull(),
  description: text('description'),
  requiresApproval: text('requiresApproval').notNull(),
  maxLicensesPerUser: text('maxLicensesPerUser').notNull(),
});

export const productRelations = relations(product, ({ many }) => ({
  licenses: many(license),
}));

export const license = defineTableWithUpdate('license', {
  key: text('key').notNull(),
  usageVolume: integer('usageVolume').notNull(),
  productId: uuid().references(() => product.id, { onDelete: 'cascade' }),
});

export const licenseRelations = relations(license, ({ one }) => ({
  product: one(product, {
    fields: [license.productId],
    references: [product.id],
  }),
}));

export * from './auth.schema';
