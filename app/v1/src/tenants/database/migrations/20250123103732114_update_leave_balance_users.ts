import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE users 
    RENAME COLUMN leavebalance TO leave_balance;

    ALTER TABLE users 
    ALTER COLUMN leave_balance TYPE NUMERIC USING leave_balance::NUMERIC;
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE users 
    ALTER COLUMN leave_balance TYPE NUMERIC USING leave_balance::NUMERIC;

    ALTER TABLE users 
    RENAME COLUMN leave_balance TO leavebalance;
  `.execute(db);
}