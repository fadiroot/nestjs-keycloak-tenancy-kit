import { Kysely, sql } from 'kysely';
import { LOCATION } from '../../../modules/location/location.constants';

export async function up(db: Kysely<unknown>) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  await db.schema
    .createTable(LOCATION)
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('work_week', sql`varchar(20)[]`, (col) => col.notNull()) // ARRAY type for enum values
    .addColumn('week_starts_on', 'varchar(20)', (col) => col.notNull())
    .addColumn('leave_quota_reset_based_on', 'varchar(50)', (col) =>
      col.notNull()
    )
    .addColumn('time_zone', 'varchar(50)', (col) => col.notNull())
    .addColumn('fiscal_year_start_month', 'varchar(20)', (col) => col.notNull())
    .addColumn('is_default', 'boolean', (col) => col.defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable(LOCATION).execute();
}
