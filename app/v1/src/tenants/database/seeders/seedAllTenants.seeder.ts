import { TenantDatabaseManager } from '../tenantDatabaseManager';
import { Database } from '../../../database/database';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { seed } from '.';

async function applySeedingToAllTenants() {
  const app = await NestFactory.create(AppModule);
  const db = app.get(Database);
  const tenantDatabaseManager = new TenantDatabaseManager();

  try {
    // Fetch all tenants from the main database
    const tenants = await db.selectFrom('tenants').selectAll().execute();

    for (const tenant of tenants) {
      console.log(`Seeding data for tenant: ${tenant.name}`);
      const tenantDb = await tenantDatabaseManager.getConnection(tenant);
      console.log('tenantDb ====>', tenantDb);

      // Seed the leave types data
      await seed(tenantDb);
    }
  } catch (error) {
    console.error('Error seeding data to all tenants:', error);
  } finally {
    await tenantDatabaseManager.closeAllConnections();
    await app.close();
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  applySeedingToAllTenants()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to seed data to all tenants:', error);
      process.exit(1);
    });
}
