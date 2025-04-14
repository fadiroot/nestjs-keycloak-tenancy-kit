import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    CREATE TABLE emergency_contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      
      relationship VARCHAR(50) CHECK (relationship IN (
        'brother', 
        'sister', 
        'father', 
        'mother', 
        'son', 
        'daughter',
        'spouse',
        'partner',
        'other'
      )) NOT NULL,

      
      mobile_phone VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      addresse VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP

    )
  `.execute(db);


 
}

export async function down(db: Kysely<unknown>) {
  await sql`
    DROP TABLE IF EXISTS emergency_contacts;
  `.execute(db);
}