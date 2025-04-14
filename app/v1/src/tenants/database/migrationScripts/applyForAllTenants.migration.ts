import { Migrator, FileMigrationProvider } from 'kysely';
import * as path from 'path';
import { promises as fs } from 'fs';
import { TenantDatabaseManager } from '../tenantDatabaseManager';
import { Database } from '../../../database/database';
import { Kysely } from 'kysely';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { seed } from '../seeders';

async function applyMigrationsToAllTenants() {
  const app = await NestFactory.create(AppModule);
  const db = app.get(Database);
  const tenantDatabaseManager = new TenantDatabaseManager();

  try {
    // Fetch all tenants from the main database
    const tenants = await db.selectFrom('tenants').selectAll().execute();

    for (const tenant of tenants) {
      console.log(`Applying migrations for tenant: ${tenant.name}`);

      const tenantDb = await tenantDatabaseManager.getConnection(tenant);
      console.log('tenantDb ====>', tenantDb);

      const migrator = new Migrator({
        db: tenantDb as unknown as Kysely<unknown>,
        provider: new FileMigrationProvider({
          fs,
          path,
          migrationFolder: path.join(__dirname, '..', 'migrations'),
        }),
      });

      const { error, results } = await migrator.migrateToLatest();

      if (results && results.length > 0) {
        results.forEach((migrationResult) => {
          if (migrationResult.status === 'Success') {
            console.log(
              `Migration "${migrationResult.migrationName}" was executed successfully for tenant ${tenant.name}`
            );
          } else if (migrationResult.status === 'Error') {
            console.error(
              `Failed to execute migration "${migrationResult.migrationName}" for tenant ${tenant.name}`
            );
          }
        });
      } else {
        console.log(`No new migrations to apply for tenant ${tenant.name}`);
      }

      if (error) {
        console.error(`Failed to migrate for tenant ${tenant.name}`);
        console.error(error);
      }

      // After migrations, seed the leave types data
      console.log(`Seeding data for tenant: ${tenant.name}`);
      await seed(db)
    }
  } catch (error) {
    console.error('Error applying migrations to all tenants:', error);
  } finally {
    await tenantDatabaseManager.closeAllConnections();
    await app.close();
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  applyMigrationsToAllTenants()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to apply migrations to all tenants:', error);
      process.exit(1);
    });
}
