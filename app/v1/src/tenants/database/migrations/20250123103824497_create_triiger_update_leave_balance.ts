import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {

  await sql`
    CREATE OR REPLACE FUNCTION update_leave_balances() RETURNS VOID AS $$
    BEGIN
      -- Update leave balances for all users with roles
      UPDATE users u
      SET leave_balance = (
        COALESCE(u.leave_balance, 0.0) + 
        (CAST(r.annual_leave_days AS NUMERIC) / 365.0)
      )::NUMERIC
      FROM roles r
      WHERE r.id = u.role_id
      AND u.role_id IS NOT NULL;
      
      RAISE NOTICE 'Leave balances updated for all users at %', NOW();
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE OR REPLACE FUNCTION trigger_leave_balance_update() RETURNS VOID AS $$
    BEGIN
      PERFORM update_leave_balances();
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE EXTENSION IF NOT EXISTS pg_cron;
  `.execute(db);

  await sql`
    SELECT cron.schedule('leave-balance-update', '0 0 * * *', 'SELECT update_leave_balances()');
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    DROP FUNCTION IF EXISTS update_leave_balances() CASCADE;
  `.execute(db);

  await sql`
    DROP FUNCTION IF EXISTS trigger_leave_balance_update() CASCADE;
  `.execute(db);

  await sql`
    SELECT cron.unschedule('leave-balance-update');
  `.execute(db);
}