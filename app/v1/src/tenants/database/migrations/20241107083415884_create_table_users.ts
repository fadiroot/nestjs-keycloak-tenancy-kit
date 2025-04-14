import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  // Drop the users table if it exists
  await sql`DROP TABLE IF EXISTS "users";`.execute(db);

  // Create the users table with VARCHAR instead of ENUM types
  await sql`
    CREATE TABLE users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      country VARCHAR(50)  NOT NULL,
      gender VARCHAR(100),
      social_security_number VARCHAR(50),
      mobile_phone_number VARCHAR(20),
      work_phone_number VARCHAR(20),
      home_email VARCHAR(255),
      birthday DATE,
      hire_date DATE,
      employment_status VARCHAR(100) NOT NULL,
      organization_id VARCHAR(100),
      location_id UUID,
      department_id UUID,
      status VARCHAR(50) DEFAULT 'active',
      marital_status VARCHAR(100),
      email_verified BOOLEAN DEFAULT false,
      street_name VARCHAR(100),
      state VARCHAR(100),
      zip VARCHAR(100),
      pay_schedule VARCHAR(100),
      per_type VARCHAR(100),
      pay_rate DECIMAL(19, 4),
      pay_type VARCHAR(100),
      img_url VARCHAR(100) , 
      leaveBalance INTEGER DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );
  `.execute(db);

  await sql`
    DROP INDEX IF EXISTS users_email_index;
    CREATE INDEX users_email_index ON "users" (email)
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    DROP INDEX IF EXISTS users_email_index;
    DROP TABLE IF EXISTS "users";
  `.execute(db);
}

