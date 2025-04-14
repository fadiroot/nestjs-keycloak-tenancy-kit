import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema.dropTable('leave_type_approvers').execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .createTable('leave_type_approvers')
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('leave_type_id', 'uuid', (col) =>
      col.notNull().references('leave_types.id').onDelete('cascade')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
    .addPrimaryKeyConstraint('pk_leave_type_approvers', [
      'leave_type_id',
      'user_id',
    ])
    .execute();
  await db.schema
    .createIndex('leave_type_approvers_idx')
    .on('leave_type_approvers')
    .column('user_id')
    .column('leave_type_id')
    .execute();
}
