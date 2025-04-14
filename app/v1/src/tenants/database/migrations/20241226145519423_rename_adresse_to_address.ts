import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
    await sql`
    ALTER TABLE emergency_contacts 
    RENAME COLUMN "addresse" TO "address"
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
    await sql`
    ALTER TABLE emergency_contacts 
    RENAME COLUMN "address" TO "addresse"
  `.execute(db);
} 