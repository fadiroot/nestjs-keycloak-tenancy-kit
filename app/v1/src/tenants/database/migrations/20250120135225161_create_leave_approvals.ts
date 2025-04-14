import { Kysely, sql } from 'kysely';
import { LEAVE_APPROVALS_TABLE } from '../../../modules/leaveApprovals/leaveApprovals.constants';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable(LEAVE_APPROVALS_TABLE)
    .addColumn('leave_id', 'uuid', (col) =>
      col.notNull().references('leaves.id').onDelete('cascade')
    )
    .addColumn('approver_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('status', 'varchar', (col) =>
      col.notNull().check(sql`status IN ('pending','approved','rejected')`)
    )
    .addColumn('reason', 'varchar(200)')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
    .addPrimaryKeyConstraint('pk_leave_approvals', ['leave_id', 'approver_id'])
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable(LEAVE_APPROVALS_TABLE).execute();
}
