import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  const columnExists = await db
    .selectFrom('information_schema.columns'as any)
    .select(sql<boolean>`EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'leave_types' 
      AND column_name = 'approver_type'
    )`.as('exists'))
    .executeTakeFirst();

  if (!columnExists?.exists) {
    await db.schema
      .alterTable('leave_types')
      .addColumn('approver_type', 'varchar(20)', (col) =>
        col.notNull().check(sql`approver_type IN ('specific', 'all')`)
      )
      .execute();
  }
}

export async function down(db: Kysely<unknown>) {
  const columnExists = await db
    .selectFrom('information_schema.columns' as any)
    .select(sql<boolean>`EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'leave_types' 
      AND column_name = 'approver_type'
    )`.as('exists'))
    .executeTakeFirst();

  if (columnExists?.exists) {
    await db.schema
      .alterTable('leave_types')
      .dropColumn('approver_type')
      .execute();
  }
}
