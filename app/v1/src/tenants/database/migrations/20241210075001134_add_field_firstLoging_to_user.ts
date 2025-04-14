import { Kysely,sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql `
  ALTER TABLE users add column is_first_login boolean Default FALSE;
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql `
  ALTER TABLE users  
  DROP COLUMN is_first_login
  `
}
