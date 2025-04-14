import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    CREATE TABLE user_visa (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      visa_type VARCHAR(50) CHECK (visa_type IN (
        'work_visa',
        'student_visa',
        'tourist_visa',
        'business_visa',
        'transit_visa',
        'permanent_residence',
        'temporary_residence',
        'diplomatic_visa',
        'official_visa',
        'family_reunion_visa',
        'investor_visa',
        'skilled_worker_visa',
        'startup_visa',
        'research_visa'
      )) NOT NULL,
      
      status VARCHAR(50) CHECK (status IN (
        'pending',
        'approved',
        'rejected',
        'expired',
        'in_process',
        'under_review',
        'cancelled',
        'suspended'
      )) NOT NULL,
      
      issuing_country VARCHAR(100) NOT NULL,
      delivery_date DATE NOT NULL,
      expiration_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP

    )
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    DROP TABLE IF EXISTS user_visa;
  `.execute(db);
}