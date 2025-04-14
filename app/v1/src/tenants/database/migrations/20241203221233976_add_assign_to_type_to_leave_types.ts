import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable('leave_types')
    .addColumn('assign_to_type', 'varchar(20)', (col) =>
      col.notNull().check(sql`assign_to_type IN ('DEPARTMENTS', 'EMPLOYEES')`)
    )
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .alterTable('leave_types')
    .dropColumn('assign_to_type')
    .execute();
}
