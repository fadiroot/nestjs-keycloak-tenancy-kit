import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  // First, ensure the uuid-ossp extension is available (for PostgreSQL)
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  await sql`
    CREATE TABLE tenants (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
      name VARCHAR(100) NOT NULL UNIQUE,
      owner_email VARCHAR(255) NOT NULL ,
      host_domain VARCHAR(255) NOT NULL UNIQUE,
      redirect_url VARCHAR(255) NOT NULL ,
      alias VARCHAR(255) NOT NULL ,
      enabled BOOLEAN ,
      db_name VARCHAR(255) NOT NULL UNIQUE, 
      db_user VARCHAR(255) NOT NULL UNIQUE,
      db_password VARCHAR(255) NOT NULL,
      db_port INT NOT NULL UNIQUE
    )
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    DROP TABLE IF EXISTS tenants
  `.execute(db);

  // Optionally remove the extension if it's no longer needed
  // await sql`DROP EXTENSION IF EXISTS "uuid-ossp"`.execute(db);
}
