import { Kysely, sql } from 'kysely';
import { DEPARTMENT_LEAVE_APPROVERS } from '../../../modules/departmentLeaveApprovers/departmentLeaveApprovers.constants';

export async function up(db: Kysely<unknown>) {
  // Drop the existing primary key constraint
  await sql`
    ALTER TABLE ${sql.table(DEPARTMENT_LEAVE_APPROVERS)} 
    DROP CONSTRAINT IF EXISTS pk_department_leave_approvers
  `.execute(db);

  // Create the new partial unique index
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS department_leave_approvers_unique_active 
    ON ${sql.table(DEPARTMENT_LEAVE_APPROVERS)} (user_id, department_id) 
    WHERE deleted_at IS NULL
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  // Drop the unique index
  await sql`
    DROP INDEX IF EXISTS department_leave_approvers_unique_active
  `.execute(db);

  // Restore the primary key constraint
  await sql`
    ALTER TABLE ${sql.table(DEPARTMENT_LEAVE_APPROVERS)} 
    ADD CONSTRAINT pk_department_leave_approvers 
    PRIMARY KEY (user_id, department_id)
  `.execute(db);
}