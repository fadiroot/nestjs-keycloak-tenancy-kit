import { Kysely , sql} from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
  CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    entity_id UUID NOT NULL, 
    entity_type VARCHAR(255) NOT NULL, 
    file_url VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
  );
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`
        DROP TABLE IF EXISTS uploaded_files;
  `.execute(db)
}

