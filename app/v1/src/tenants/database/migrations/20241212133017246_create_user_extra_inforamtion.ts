import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    
    CREATE TABLE "user_extra_information" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      allergies VARCHAR[] DEFAULT '{}',
      dietary_restrictions VARCHAR[] DEFAULT '{}',
      spoken_languages VARCHAR[] DEFAULT '{}',
      shirt_size VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL
    )
  `.execute(db);
  await sql`
  ALTER TABLE users 
  ADD COLUMN  user_extra_inforamtion_id UUID 
  REFERENCES user_extra_information(id);
`.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    DROP TABLE IF EXISTS "user_extra_information";
  `.execute(db);
}