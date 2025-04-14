import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { TenantDatabase } from './database';
import { Tenant } from '../../database/tenantsTable';

@Injectable()
export class TenantDatabaseManager implements OnModuleDestroy {
  private readonly logger = new Logger(TenantDatabaseManager.name);
  private connectionPools: Map<string, TenantDatabase> = new Map();

  async getConnection(tenant: Tenant.selectable): Promise<TenantDatabase> {
    const key = `${tenant.id}:${tenant.db_name}`;

    this.logger.log(`Attempting to get connection for tenant: ${tenant.name}`);
    this.logger.log(`Current connection pools: ${JSON.stringify(Array.from(this.connectionPools.keys()))}`);

    try {
      // Check if a connection pool already exists
      if (this.connectionPools.has(key)) {
        const existingPool = this.connectionPools.get(key);

        // Log existing pool details with safe connection count
        this.logger.log(`Existing pool found for key: ${key}`);
        this.logger.log(`Existing pool active connections: ${existingPool.activeConnections || 0}`);

        // Always return the existing connection pool
        return existingPool;
      }

     this.logger.log(`No existing pool for ${key}. Creating new connection.`);
      const newConnection = await this.createNewConnection(tenant);
      this.connectionPools.set(key, newConnection);
      return newConnection;

    } catch (error) {
      this.logger.error(`Error in getConnection for tenant ${tenant.name}`, error);
      throw error;
    }
  }

  private createNewConnection(tenant: Tenant.selectable): TenantDatabase {
    this.logger.log(`Creating new connection for tenant: ${tenant.name}`);
    const connection = new TenantDatabase({
      host: tenant.db_name.split('_')[1],
      port: +process.env.POSTGRES_PORT,
      user: tenant.db_user,
      password: tenant.db_password,
      database: tenant.db_name,
    });


    return connection;
  }

  async closeAllConnections() {
    this.logger.log('Closing all tenant database connections');
    for (const [key, connection] of this.connectionPools.entries()) {
      try {
        await connection.destroy();
        this.logger.log(`Closed connection for key: ${key}`);
      } catch (error) {
        this.logger.error(`Error closing connection for ${key}`, error);
      }
    }
    this.connectionPools.clear();
  }

  async onModuleDestroy() {
    await this.closeAllConnections();
  }
}
