import { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>) {
  db.schema
    .alterTable('roles')
    .addColumn('description', 'varchar(200)', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>) {
  db.schema.alterTable('roles').dropColumn('description').execute();
}
