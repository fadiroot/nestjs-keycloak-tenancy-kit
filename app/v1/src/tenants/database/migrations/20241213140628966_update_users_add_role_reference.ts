import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE users 
    ADD COLUMN role_id UUID 
    REFERENCES roles(id) ON DELETE SET NULL;

    CREATE INDEX idx_users_role_id ON users(role_id);
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    DROP INDEX IF EXISTS idx_users_role_id;

    ALTER TABLE users 
    DROP COLUMN IF EXISTS role_id;
  `.execute(db);
}