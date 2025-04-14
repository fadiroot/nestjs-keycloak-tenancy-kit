import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE "pending_users" 
    RENAME COLUMN "user_role_id" TO "role_id"
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE "pending_users" 
    RENAME COLUMN "role_id" TO "user_role_id"
  `.execute(db);
}