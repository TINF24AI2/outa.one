import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgTable, serial, text, unique, uuid } from 'drizzle-orm/pg-core';
import { defineTableWithUpdate } from './utils/table-factory';

export const task = pgTable('task', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  priority: integer('priority').notNull().default(1),
});

export const product = defineTableWithUpdate('product', {
  name: text('name').notNull(),
  description: text('description'),
  requiresApproval: boolean('requiresApproval').notNull().default(false),
  maxLicensesPerUser: integer('maxLicensesPerUser').notNull().default(1),
});

export const productRelations = relations(product, ({ many }) => ({
  licenses: many(license),
}));

export const license = defineTableWithUpdate(
  'license',
  {
    key: text('key').notNull(),
    usageVolume: integer('usageVolume').notNull(),
    productId: uuid().references(() => product.id, { onDelete: 'cascade' }),
  },
  (table) => [unique().on(table.productId, table.key), index('license_productId_idx').on(table.productId)],
);

export const licenseRelations = relations(license, ({ one }) => ({
  product: one(product, {
    fields: [license.productId],
    references: [product.id],
  }),
}));

export * from './auth.schema';
