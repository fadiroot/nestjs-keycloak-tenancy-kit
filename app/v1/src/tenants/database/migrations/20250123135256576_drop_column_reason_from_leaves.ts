import { Kysely } from 'kysely';
import { LEAVE_TABLE } from '../../../modules/leave/leave.constants';

export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable(LEAVE_TABLE).dropColumn('reason').execute();
}

export async function down(db: Kysely<unknown>) {
  db.schema
    .alterTable(LEAVE_TABLE)
    .addColumn('reason', 'varchar(200)')
    .execute();
}
