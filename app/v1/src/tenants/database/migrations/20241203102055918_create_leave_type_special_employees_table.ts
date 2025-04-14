import { Kysely, sql } from 'kysely';
import { LEAVE_TYPE_SPECIAL_EMPLOYEES } from '../../../modules/leaveTypeSpecialEmployees/leaveTypeSpecialEmployees.constants';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable(LEAVE_TYPE_SPECIAL_EMPLOYEES)
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
    .addPrimaryKeyConstraint('pk_leave_type_special_employees', [
      'leave_type_id',
      'user_id',
    ])
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('leave_type_special_employees').execute();
}
