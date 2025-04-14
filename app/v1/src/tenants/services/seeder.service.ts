import { Inject, Injectable, Logger } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Tenant } from '../../database/tenantsTable';
import { TENANT_DB } from '../constants';
import { TenantDatabase } from '../database/database';
import { TenantDatabaseManager } from '../database/tenantDatabaseManager';
import { CurrentTenantService } from './currentTenant.service';

const ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'list',
  'manage',
] as const;

type PermissionRecord = {
  name: string;
  resource?: string; // optional, but we will ensure it is always set
};

type PermissionFormat =
  | `${Resource}:${Action}`
  | `${Resource}:*`
  | 'system:admin';

type Resource = string;
type Action = (typeof ACTIONS)[number];

@Injectable()
export class PermissionSeederService {
  private readonly logger = new Logger(PermissionSeederService.name);

  constructor(private currentTenantService: CurrentTenantService) {}

  async seed(tenant): Promise<void> {
    const tenantDatabaseManager = new TenantDatabaseManager();
    const db: any = await tenantDatabaseManager.getConnection(tenant);

    const tables = await db
      .selectFrom('information_schema.tables')
      .select('table_name')
      .where('table_schema', '=', 'public') // adjust schema as needed
      .execute();

    let resources = tables.map((row) => row.table_name);

    const resourcesToRemove = [
      'kysely_migration',
      'kysely_migration_lock',
      'permissions',
    ];
    resources = resources.filter((item) => !resourcesToRemove.includes(item));

    const permissions: PermissionRecord[] = [];
    
    for (const resource of resources) {
      for (const action of ACTIONS) {
        permissions.push({
          name: `${resource}:${action}` as PermissionFormat,
          resource: resource, 
        });
      }

      // Add wildcard permission for each resource
      permissions.push({
        name: `${resource}:*` as PermissionFormat,
        resource: resource, 
      });
    }

    // Add system-wide admin permission
    permissions.push({
      name: 'system:admin' as PermissionFormat,
    });

    try {
      await db.transaction().execute(async (trx) => {
        // Clear existing permissions
        await trx.deleteFrom('permissions').execute();

        // Insert new permissions
        for (const permission of permissions) {
          // Ensure resource is not undefined or null before inserting
          if (permission.resource) {
            await trx
              .insertInto('permissions')
              .values({
                name: permission.name,
                resource: permission.resource, // Make sure the resource is included
              })
              .execute();
          } else {
            this.logger.warn(
              `Skipping permission ${permission.name} as resource is missing.`
            );
          }
        }
        await trx
          .insertInto('roles')
          .values({
            name: 'super-admin',
            description:'good job'
            
          })
          .execute();
      });

      this.logger.log(`Successfully seeded ${permissions.length} permissions`);
    } catch (error) {
      this.logger.error('Error seeding permissions:', error);
      throw error;
    }
  }
}
