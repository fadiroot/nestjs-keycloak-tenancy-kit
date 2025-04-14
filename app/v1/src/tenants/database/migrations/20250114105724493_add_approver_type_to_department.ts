import { Kysely } from 'kysely';
import { DEPARTMENT_TABLE } from '../../../modules/department/department.constants';

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable(DEPARTMENT_TABLE)
    .addColumn('approver_type', 'varchar(20)', (col) => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .alterTable(DEPARTMENT_TABLE)
    .dropColumn('approver_type')
    .execute();
}
 