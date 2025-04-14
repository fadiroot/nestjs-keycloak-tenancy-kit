import { Kysely ,sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  sql `
  ALTER TABLE roles add column annual_leave_days INT DEFAULT 0;
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  sql`
  ALTER TABLE roles DROP COLUMN annual_leave_days;
  `
}
