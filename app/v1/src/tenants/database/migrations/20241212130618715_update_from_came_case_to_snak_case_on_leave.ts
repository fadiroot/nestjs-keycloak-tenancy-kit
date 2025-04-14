import { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable('leaves').renameColumn('userid', 'user_id').execute();
  await db.schema.alterTable('leaves').renameColumn('leavetypeid', 'leave_type_id').execute();
  await db.schema.alterTable('leaves').renameColumn('startdate', 'start_date').execute();
  await db.schema.alterTable('leaves').renameColumn('enddate', 'end_date').execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.alterTable('leaves').renameColumn('user_id', 'userid').execute();
  await db.schema.alterTable('leaves').renameColumn('leave_type_id', 'leavetypeid').execute();
  await db.schema.alterTable('leaves').renameColumn('start_date', 'startdate').execute();
  await db.schema.alterTable('leaves').renameColumn('end_date', 'enddate').execute();
}
