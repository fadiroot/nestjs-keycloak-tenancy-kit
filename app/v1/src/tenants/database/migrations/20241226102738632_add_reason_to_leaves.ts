import { Kysely } from 'kysely';
import { LEAVE_TABLE } from '../../../modules/leave/leave.constants';

export async function up(db: Kysely<unknown>) {
  db.schema
    .alterTable(LEAVE_TABLE)
    .addColumn('reason', 'varchar(200)')
    .alterColumn('start_date', (col) => col.setDataType('timestamp'))
    .alterColumn('end_date', (col) => col.setDataType('timestamp'))
    .execute();
}

export async function down(db: Kysely<unknown>) {
  db.schema
    .alterTable(LEAVE_TABLE)
    .dropColumn('reason')
    .alterColumn('start_date', (col) => col.setDataType('date'))
    .alterColumn('end_date', (col) => col.setDataType('date'))
    .execute();
}
