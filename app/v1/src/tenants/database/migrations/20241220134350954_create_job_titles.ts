import { Kysely , sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
  CREATE TABLE job_titles (
    job_title VARCHAR(100) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
  );

  ALTER TABLE users ADD COLUMN job_title VARCHAR(100) REFERENCES job_titles(job_title) ;
  ALTER TABLE pending_users ADD COLUMN job_title VARCHAR(100) REFERENCES job_titles(job_title);
  `.execute(db);
}


export async function down(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE users DROP COLUMN IF EXISTS job_title_id;
    ALTER TABLE pending_users DROP COLUMN IF EXISTS job_title_id;
    DROP TABLE IF EXISTS job_titles;
  `.execute(db);
}

