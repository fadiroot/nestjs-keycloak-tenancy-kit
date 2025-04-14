import { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>) {
  db.schema
    .alterTable('leave_types')
    .addColumn('is_all_departments', 'boolean', (col) => col.defaultTo(false))
    .addColumn('is_all_locations', 'boolean', (col) => col.defaultTo(false))
    .execute();
}

export async function down(db: Kysely<unknown>) {
  db.schema
    .alterTable('leave_types')
    .dropColumn('is_all_departments')
    .dropColumn('is_all_locations')
    .execute();
}
