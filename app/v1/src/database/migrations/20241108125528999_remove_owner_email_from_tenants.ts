import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
    await sql`
    ALTER TABLE tenants 
    DROP COLUMN IF EXISTS owner_email
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
    await sql`
    ALTER TABLE tenants 
    ADD COLUMN owner_email VARCHAR(255)
  `.execute(db);
} 