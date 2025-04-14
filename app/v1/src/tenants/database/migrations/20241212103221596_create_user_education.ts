import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    CREATE TABLE user_education (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID  REFERENCES users(id) ON DELETE CASCADE,
      institution VARCHAR(255) NOT NULL,
      degree VARCHAR(100) CHECK (degree IN (
        'high_school',  
        'associate_degree', 
        'bachelor_degree', 
        'master_degree', 
        'doctoral_degree', 
        'professional_degree', 
        'certificate'
      )) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP

      
    )
  `.execute(db);


}

export async function down(db: Kysely<unknown>) {
  await sql `
  DROP TABLE IF EXISTS user_education
  `
  
}