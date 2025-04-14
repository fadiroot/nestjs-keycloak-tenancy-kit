import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  await sql`
    DROP TABLE IF EXISTS "leaves";

    CREATE TABLE "leaves" (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      userId UUID NOT NULL,
      leaveTypeId UUID NOT NULL,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      comment VARCHAR(255),
      attachment VARCHAR(255),
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (leaveTypeId) REFERENCES leave_types(id)
    )
  `.execute(db);

  await sql`
    CREATE INDEX leaves_user_id_index ON "leaves" (userId);
  `.execute(db);

  await sql`
    CREATE INDEX leaves_leave_type_index ON "leaves" (leaveTypeId);
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    DROP INDEX IF EXISTS leaves_leave_type_index;
    DROP INDEX IF EXISTS leaves_user_id_index;
    DROP TABLE IF EXISTS "leaves";
  `.execute(db);
}
