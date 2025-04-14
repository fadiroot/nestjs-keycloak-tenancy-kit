import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { TenantService } from '../tenant.service';
import { CurrentTenantService } from './currentTenant.service';
import { TenantDatabaseManager } from '../database/tenantDatabaseManager';

@Injectable()
export class TenantDatabaseSetupService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly currentTenantService: CurrentTenantService,
    private readonly tenantDatabaseManager: TenantDatabaseManager,
    private readonly logger: Logger,
  ) {
  }

  async setupTenantDatabase(request) {
    const orgId =  request.headers['organization-kc-id'] as string;

    if (!orgId) {
      this.logger.warn('No Keycloak ID found in request headers');
      return null;
    }

    this.logger.log(`Setting up tenant database for KC ID: ${orgId}`);

    try {
      const tenant = await this.tenantService.getTenantById(orgId);

      if (!tenant) {
        this.logger.warn(`Tenant not found for KC ID: ${orgId}`);
        return null;
      }

      this.currentTenantService.setTenant(tenant);

      const tenantDb = await this.tenantDatabaseManager.getConnection(tenant);

      if (!tenantDb) {
        this.logger.error(`Unable to establish database connection for tenant ${orgId}`);
        return null;
      }


      return tenantDb;
    } catch (error) {
      this.logger.error(`Error setting up tenant database: ${error}`, error);
      return null;
    }
  }
}
