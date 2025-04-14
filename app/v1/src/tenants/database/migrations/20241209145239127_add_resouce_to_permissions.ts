import { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable('permissions')
    .addColumn('resource', 'varchar(40)')
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.alterTable('permissions').dropColumn('resource').execute();
}
