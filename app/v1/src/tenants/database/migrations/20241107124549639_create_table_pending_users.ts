import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    
    CREATE TABLE "pending_users" (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL ,
      marital_status VARCHAR(20),
      first_name VARCHAR(100) NOT NULL  ,
      last_name VARCHAR(100) NOT NULL ,
      gender VARCHAR(10),
      social_security_number VARCHAR(50),
      mobile_phone_number VARCHAR(20),
      country VARCHAR(20) NOT NULL,
      work_phone_number VARCHAR(20),
      birthday DATE,
      hire_date DATE,
      employment_status VARCHAR(100),
      street_name VARCHAR(100),
      state VARCHAR(100),
      zip VARCHAR(100),
      pay_schedule VARCHAR(100),
      per_type VARCHAR(100),
      pay_rate DECIMAL(19, 4),
      pay_type VARCHAR(100),
      home_email VARCHAR(255),
      organization_id VARCHAR(100),
      location_id UUID,
      user_role_id UUID REFERENCES "roles"(id) ON DELETE SET NULL,
      department_id UUID,
      img_url VARCHAR(100) , 
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
      deletedAt TIMESTAMP DEFAULT NULL
    )
  `.execute(db);

  await sql`
    DROP INDEX IF EXISTS pending_users_email_index;
    CREATE INDEX pending_users_email_index ON "pending_users" (email)
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    DROP INDEX IF EXISTS pending_users_email_index;
    DROP TABLE IF EXISTS "pending_users"
  `.execute(db);
}