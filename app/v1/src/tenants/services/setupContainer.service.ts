import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import Docker from 'dockerode';
import { promisify } from 'util';
import { Database } from '../../database/database';
import {
  ContainerTest,
  TENANT_NETWORK,
  TENANTS_TABLE,
  TestContainerPort,
} from '../constants';
import {
  Migrator,
  FileMigrationProvider,
  Kysely,
  PostgresDialect,
} from 'kysely';
import * as path from 'path';
import { copyFileSync, promises as fs } from 'fs';
import { Pool } from 'pg';
import * as generator from 'generate-password';
import { ConfigService } from '@nestjs/config';
import { seed } from '../database/seeders';

const execAsync = promisify(exec);

@Injectable()
export default class SetupContainer {
  private readonly docker: Docker;
  private readonly MIN_PORT = 5434; 
  private readonly MAX_PORT = 5533;
  private readonly configService: ConfigService;
  constructor(private db?: Database) {
    this.docker = new Docker();
  }
  private async getAvailablePort(TypeContainer?: string): Promise<number> {
    if (TypeContainer === ContainerTest && TypeContainer) {
      return TestContainerPort;
    }

    const usedPorts = await this.db
      .selectFrom(TENANTS_TABLE)
      .select('db_port')
      .execute()
      .then((tenants) => tenants.map((t) => t.db_port));

    for (let port = this.MIN_PORT; port <= this.MAX_PORT; port++) {
      if (!usedPorts.includes(port)) {
        return port;
      }
    }
    throw new Error('No available ports');
  }

  async createContainer(
    tenantName: string,
    TypeContainer?: string
  ): Promise<{
    containerId: string;
    port: number;
    dbName: string;
    dbUser: string;
    dbPassword: string;
    host: string;
  }> {
    const containerName = tenantName;
    const port = await this.getAvailablePort(TypeContainer);
    const dbName = `db_${tenantName}`;
    const dbUser = `user_${tenantName}`;
    const dbPassword = this.generateRandomPassword();
    const host = tenantName;
    const networkName = TENANT_NETWORK;

    try {
      const network = await this.docker.getNetwork(networkName);
      if (!network) {
        throw new Error (`network = ${network} not exist`)
      }
      console.log(`Creating container for tenant: ${tenantName}`);
      const container = await this.docker.createContainer({
        Image: 'postgres:16',
        name: containerName,
        Env: [
          `POSTGRES_USER=${dbUser}`,
          `POSTGRES_PASSWORD=${dbPassword}`,
          `POSTGRES_DB=${dbName}`,
        ],
        HostConfig: {
          PortBindings: {
            '5432/tcp': [{ HostPort: port.toString() }],
          },
          NetworkMode: networkName,
        },
        labels: {
          'io.portainer.accesscontrol.users': 'companyhr',
        },
      },);

      console.log(`Starting container for tenant: ${tenantName}`);
      await container.start();

      console.log(`Waiting for Postgres to be ready after configuration changes: ${container.id}`);
      await this.waitForPostgresToBeReady(port, container.id);

      console.log(`Performing additional pg_cron setup for container: ${container.id}`);
      await execAsync(`docker exec ${containerName} apt-get update`);
      await execAsync(`docker exec ${containerName} apt-get install -y postgresql-16-cron`);
      await execAsync(`docker exec ${containerName} bash -c "echo 'shared_preload_libraries = '\''pg_cron'\'' ' >> /var/lib/postgresql/data/postgresql.conf"`);
      await execAsync(`docker exec ${containerName} bash -c "echo 'cron.database_name = '\''${dbName}'\'' ' >> /var/lib/postgresql/data/postgresql.conf"`);

      console.log(`pg_cron extension installed for database: ${dbName}`);

      console.log(`Container setup completed for tenant: ${tenantName}`);
      return {
        containerId: container.id,
        port,
        dbName,
        dbUser,
        dbPassword,
        host,
      };
    } catch (error) {
      console.error(
        `Error during container creation for tenant ${tenantName}:`
      );
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      } else {
        console.error('Unexpected error:', error);
      }
      try {
        const info = await this.docker.info();
        console.error('Docker daemon info:', JSON.stringify(info, null, 2));
      } catch (infoError) {
        console.error('Failed to retrieve Docker daemon info:', infoError);
      }

      throw new Error(
        `Failed to create container for tenant ${tenantName}: ${error}`
      );
    }
  }
  async deleteContainer(containerId: string) {
    try {
      const container = this.docker.getContainer(containerId);
      console.log(`Removing container ${containerId}`);
      await container.remove({ force: true, v: true });
    } catch {
      console.log(
        `Container ${containerId} not found , might have been already removed`
      );
    }
  }

  private generateRandomPassword(): string {
    return generator.generate({
      length: 16,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      strict: true,
    });
  }

  private async waitForPostgresToBeReady(port: number, containerId: string) {
    console.log(`Waiting for Postgres on port ${port} to be ready...`);
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    let retries = 10;
    while (retries > 0) {
      try {
        const container = await this.docker.getContainer(containerId);
        const logs = await container.logs({
          stdout: true,
          stderr: true,
          tail: 50,
        });
        const logsString = logs.toString();

        if (
          logsString.includes('PostgreSQL init process complete; ready for start up.') ||
          logsString.includes('database system is ready to accept connections')
        ) {
          console.log(`Postgres on port ${port} is ready`);
          break;
        }
        await execAsync(`pg_isready -h host.docker.internal -p ${port}`);
        console.log(`Postgres on port ${port} is ready (pg_isready)`);
        break;
      } catch (err) {
        retries -= 1;
        console.log(
          `${new Date().toISOString()} Waiting for Postgres on port ${port} to be ready... (${retries} retries left)`
        );
        await delay(5000); // 5-second delay between retries
      }
    }

    if (retries === 0) {
      console.error(
        `Postgres on port ${port} did not become ready after multiple attempts`
      );

      try {
        const container = await this.docker.getContainer(containerId);
        const logs = await container.logs({
          stdout: true,
          stderr: true,
        });
        console.error('Container logs:', logs.toString());
      } catch (logError) {
        console.error('Failed to retrieve container logs:', logError);
      }

      throw new Error(`Postgres on port ${port} did not become ready in time`);
    }
  }

  async runMigrationsAndSeeders(containerInfo: {
    containerId: string;
    port: number;
    dbName: string;
    dbUser: string;
    dbPassword?: string;
  }) {
    let db: Kysely<unknown> | null = null;

    try {
      console.log(`Restarting container before migrations: ${containerInfo.containerId}`);
      const container = await this.docker.getContainer(containerInfo.containerId);
      await container.restart();

      console.log('Waiting for container to be fully restarted and initialized...');
      await this.extendedContainerWait(containerInfo);

      const connectionInfo = {
        host: 'host.docker.internal',
        port: containerInfo.port,
        user: containerInfo.dbUser,
        password: containerInfo.dbPassword || '',
        database: containerInfo.dbName,
      };

      console.log('Container Database Connection Info:', connectionInfo);

      // Create Kysely database instance
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
          migrationFolder: path.join(__dirname, '..', 'database', 'migrations'),
        }),
      });

      console.log('Starting migration process for container database...');

      const { error, results } = await migrator.migrateToLatest();

      if (error) {
        console.error('Migration error:', error);
        throw error;
      }

      results?.forEach((migrationResult) => {
        if (migrationResult.status === 'Success') {
          console.log(`Migration "${migrationResult.migrationName}" was applied successfully`);
        } else if (migrationResult.status === 'Error') {
          console.error(`Migration "${migrationResult.migrationName}" failed`);
        }
      });

      console.log('Migrations completed successfully');
      await seed(db)
      return results;
      

    } catch (error) {
      console.error('Error in runMigrations:', error);
      throw error;
    } finally {
      if (db) {
        console.log('Destroying container database connection...');
        await db.destroy();
      }
    }
  }

  // Extended container wait method using container-specific configuration
  private async extendedContainerWait(containerInfo: {
    containerId: string;
    port: number;
    dbName: string;
    dbUser: string;
    dbPassword?: string;
  }) {
    const maxRetries = 60;  
    const retryInterval = 5000; 

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Container restart wait - Attempt ${attempt}/${maxRetries}`);

        // Check container status
        const container = await this.docker.getContainer(containerInfo.containerId);
        const containerDetails = await container.inspect();

        // Verify container is running
        if (!containerDetails.State.Running) {
          console.log('Container is not in running state');
          await new Promise(resolve => setTimeout(resolve, retryInterval));
          continue;
        }
        try {
          await this.testDatabaseConnection({
            port: containerInfo.port,
            dbName: containerInfo.dbName,
            dbUser: containerInfo.dbUser,
            dbPassword: containerInfo.dbPassword,
          });
          console.log('Database connection successful after restart');
          return;
        } catch (connectionError) {
          console.log(`Database connection attempt failed (Attempt ${attempt}):`, connectionError);
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      } catch (error) {
        console.error(`Error during container wait - Attempt ${attempt}:`, error);

        if (attempt === maxRetries) {
          throw new Error(`Container did not become ready after ${maxRetries} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }

    throw new Error('Container did not become ready in time');
  }

  private async testDatabaseConnection(containerInfo: {
    port: number;
    dbName: string;
    dbUser: string;
    dbPassword: string;
  }) {
    return new Promise((resolve, reject) => {
      const client = new Pool({
        host: containerInfo.dbName.split('_')[1],
        port:+process.env.POSTGRES_PORT,
        user: containerInfo.dbUser,
        password: containerInfo.dbPassword,
        database: containerInfo.dbName,
        connectionTimeoutMillis: 5000,
      });

      client.connect((err, connection) => {
        if (err) {
          client.end();
          return reject(err);
        }
        connection.query('SELECT NOW()', (queryErr) => {
          connection.release();
          client.end();
          if (queryErr) {
            return reject(queryErr);
          }

          resolve(true);
        });
      });
    });
  }

  async cleanupTestContainer(containerId: string): Promise<void> {
    console.log('Stopping and removing test container...');
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
      await container.remove();
      console.log('Test container stopped and removed successfully.');
    } catch (err) {
      console.error('Error stopping and removing test container:', err);
      throw err;
    }
  }
}
