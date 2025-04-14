import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  // Create the uuid-ossp extension for generating UUIDs
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  // Create the leave_types table
  await db.schema
    .createTable('leave_types')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('icon', 'integer', (col) => col.notNull())
    .addColumn('name', 'varchar(20)', (col) => col.notNull().unique())
    .addColumn('approver_type', 'varchar(20)', (col) =>
      col.notNull().check(sql`approver_type IN ('specific', 'all')`)
    )
    .addColumn('yearly_quota_type', 'varchar(20)', (col) =>
      col.notNull().check(sql`yearly_quota_type IN ('limited', 'unlimited')`)
    )
    .addColumn('yearly_quota_value', 'integer', (col) => col.notNull())
    .addColumn('yearly_quota_unit', 'varchar(20)', (col) =>
      col.notNull().check(sql`yearly_quota_unit IN ('days', 'hours')`)
    )
    .addColumn('allow_negative_balance', 'boolean', (col) => col.notNull())
    .addColumn('reason_required', 'boolean', (col) => col.notNull())
    .addColumn('subtract_weekends', 'boolean', (col) => col.notNull())
    .addColumn('default', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<unknown>) {
  // Drop the leave_types table if rolling back
  await db.schema.dropTable('leave_types').execute();
}
