import { Kysely, sql } from 'kysely';
import { DEPARTMENT_LEAVE_APPROVERS } from '../../../modules/departmentLeaveApprovers/departmentLeaveApprovers.constants';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable(DEPARTMENT_LEAVE_APPROVERS)
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('department_id', 'uuid', (col) =>
      col.notNull().references('departments.id').onDelete('cascade')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
    .addPrimaryKeyConstraint('pk_department_leave_approvers', [
      'user_id',
      'department_id',
    ])
    .execute();

  await db.schema
    .createIndex('department_approvers_user_department_idx')
    .on(DEPARTMENT_LEAVE_APPROVERS)
    .column('user_id')
    .column('department_id')
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable(DEPARTMENT_LEAVE_APPROVERS).execute();
}
