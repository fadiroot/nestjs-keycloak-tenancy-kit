import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE "pending_users"
    DROP COLUMN id ,
    ADD CONSTRAINT pk_pending PRIMARY KEY (email),
    ADD COLUMN hire_date_welcome DATE,
    ADD COLUMN arrive_time TIME,
    ADD COLUMN manager UUID REFERENCES users(id),
    ADD COLUMN other_instructions VARCHAR(400)
  `.execute(db);

  await sql`
    CREATE TABLE employee_contacts (
      employee_email VARCHAR(200) REFERENCES pending_users(email),
      contact_id UUID REFERENCES users(id) ,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP,
      PRIMARY KEY (employee_email, contact_id)
    )
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    DROP TABLE IF EXISTS employee_contacts
  `.execute(db);

  await sql`
    ALTER TABLE "pending_users"
    DROP COLUMN hire_date_welcome,
    DROP COLUMN arrive_time,
    DROP COLUMN manager,
    DROP COLUMN other_instructions
  `.execute(db);
}