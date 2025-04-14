import {
  Migrator,
  FileMigrationProvider,
  Kysely,
  PostgresDialect,
} from 'kysely';
import * as path from 'path';
import { promises as fs } from 'fs';
import { Pool } from 'pg';
import SetupContainer from '../../services/setupContainer.service';
import { ContainerTest } from '../../constants';

const setupContainer = new SetupContainer();

async function applyMigrationsToTestTenant() {
  let db: Kysely<unknown> | null = null;
  let containerId: string | null = null;

  try {
    const containerInfo = await setupContainer.createContainer(
      'test',
      ContainerTest
    );
    containerId = containerInfo.containerId;

    const connectionInfo = {
      host: 'host.docker.internal',
      port: containerInfo.port,
      user: containerInfo.dbUser,
      password: containerInfo.dbPassword,
      database: containerInfo.dbName,
    };

    console.log('Tenant Database Connection Info:', connectionInfo);

    db = new Kysely<unknown>({
      dialect: new PostgresDialect({
        pool: new Pool({
          ...connectionInfo,
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 60000,
          max: 1,
        }),
      }),
    });

    const migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(__dirname, '..', 'migrations'),
      }),
    });

    console.log('Starting migration process for tenant database...');
    const { error, results } = await migrator.migrateToLatest();
    console.log('Migration results:', results);

    if (results && results.length > 0) {
      const successfulMigrations = results.filter(
        (r) => r.status === 'Success'
      );
      const failedMigrations = results.filter((r) => r.status === 'Error');

      console.log(`Total migrations run: ${results.length}`);
      console.log(`Successful migrations: ${successfulMigrations.length}`);
      console.log(`Failed migrations: ${failedMigrations.length}`);

      if (failedMigrations.length > 0) {
        console.error('The following migrations failed:');
        failedMigrations.forEach((migration) => {
          console.error(`- ${migration.migrationName}`);
        });
      }

      if (failedMigrations.length === 0) {
        console.log(
          'All migrations were applied successfully to tenant database!'
        );
      } else {
        console.error(
          `Error: ${failedMigrations.length} migration(s) failed to apply to tenant database.`
        );
      }
    } else {
      console.log('No new migrations to apply to tenant database');
    }

    if (error) {
      console.error('Failed to apply migrations to tenant database');
      console.error(error);
    } else {
      console.log(
        'Migration process completed successfully for tenant database'
      );
    }
  } catch (error) {
    console.error('Error during migration process for tenant database:', error);
  } finally {
    if (db) {
      console.log('Destroying tenant database connection...');
      await db
        .destroy()
        .catch((err) =>
          console.error('Error destroying tenant database connection:', err)
        );
    }

    if (containerId) {
      try {
        await setupContainer.cleanupTestContainer(containerId);
        console.log('Test container cleaned up successfully.');
      } catch (err) {
        console.error('Error cleaning up test container:', err);
      }
    }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  applyMigrationsToTestTenant()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to apply migrations to test tenant:', error);
      process.exit(1);
    });
}

export { applyMigrationsToTestTenant };
