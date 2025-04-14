import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    CREATE TABLE role_permission (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      role_id UUID,
      permission_id UUID,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    )
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`DROP TABLE IF EXISTS role_permissions`.execute(db);
}
