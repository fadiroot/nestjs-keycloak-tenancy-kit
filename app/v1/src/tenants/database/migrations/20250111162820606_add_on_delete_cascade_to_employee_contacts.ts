import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE employee_contacts 
    DROP CONSTRAINT employee_contacts_employee_email_fkey,
    ADD CONSTRAINT employee_contacts_employee_email_fkey 
    FOREIGN KEY (employee_email) 
    REFERENCES pending_users(email) ON DELETE CASCADE,
    
    DROP CONSTRAINT employee_contacts_contact_id_fkey,
    ADD CONSTRAINT employee_contacts_contact_id_fkey 
    FOREIGN KEY (contact_id) 
    REFERENCES users(id) ON DELETE CASCADE
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE employee_contacts 
    DROP CONSTRAINT employee_contacts_employee_email_fkey,
    ADD CONSTRAINT employee_contacts_employee_email_fkey 
    FOREIGN KEY (employee_email) 
    REFERENCES pending_users(email),
    
    DROP CONSTRAINT employee_contacts_contact_id_fkey,
    ADD CONSTRAINT employee_contacts_contact_id_fkey 
    FOREIGN KEY (contact_id) 
    REFERENCES users(id)
  `.execute(db);
}