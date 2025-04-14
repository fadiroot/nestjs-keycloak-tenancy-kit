import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    CREATE TABLE permissions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`DROP TABLE IF EXISTS permissions`.execute(db);
}
