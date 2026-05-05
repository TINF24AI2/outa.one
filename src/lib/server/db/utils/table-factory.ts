import type { BuildExtraConfigColumns } from 'drizzle-orm';
import { type PgColumnBuilderBase, type PgTableExtraConfigValue, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

const baseColumns = {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
};

const baseColumnsWithUpdate = {
  ...baseColumns,
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

/**
 * A helper function for defining a postgres table with a randomly generated id and a createdAt field.
 *
 * @param name The name of the table.
 * @param columns The additional columns of the table.
 * @returns The drizzle pgtable object.
 */
export const defineTable = <TName extends string, TColumns extends Record<string, PgColumnBuilderBase>>(
  name: TName,
  columns: TColumns,
  extraConfig?: (
    self: BuildExtraConfigColumns<typeof name, typeof baseColumns & TColumns, 'pg'>,
  ) => PgTableExtraConfigValue[],
) => {
  return pgTable(
    name,
    {
      ...baseColumns,
      ...columns,
    },
    (table) => {
      return extraConfig ? extraConfig(table) : [];
    },
  );
};

/**
 * A helper function for defining a postgres table with a randomly generated id and a createdAt field, as well as an updatedAt
 * field that updates automatically when a row in the table is changed.
 *
 * @param name The name of the table.
 * @param columns The additional columns of the table.
 * @returns The drizzle pgtable object.
 */
export const defineTableWithUpdate = <TName extends string, TColumns extends Record<string, PgColumnBuilderBase>>(
  name: TName,
  columns: TColumns,
  extraConfig?: (
    self: BuildExtraConfigColumns<typeof name, typeof baseColumnsWithUpdate & TColumns, 'pg'>,
  ) => PgTableExtraConfigValue[],
) => {
  return pgTable(
    name,
    {
      ...baseColumnsWithUpdate,
      ...columns,
    },
    (table) => {
      return extraConfig ? extraConfig(table) : [];
    },
  );
};
