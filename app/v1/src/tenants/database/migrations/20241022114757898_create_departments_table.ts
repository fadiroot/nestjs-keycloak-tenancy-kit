import { Kysely, sql } from 'kysely';
import { DEPARTMENT } from '../../../modules/department/department.constants';

export async function up(db: Kysely<unknown>) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);
  await db.schema
    .createTable(DEPARTMENT)
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
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
  await db.schema.dropTable(DEPARTMENT).execute();
}
