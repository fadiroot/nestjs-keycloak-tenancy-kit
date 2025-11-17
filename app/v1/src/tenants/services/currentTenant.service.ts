import { Request } from 'express';
import { Tenant } from '../../database/tenantsTable';
import { TenantDatabase } from '../database/database';

export class CurrentTenantService {
  private _tenant: Tenant.selectable | null = null;
  private _request: Request;

  constructor() {}

  setTenant(tenant: Tenant.selectable) {
    if (this._tenant) {
      this.logPotentialConflict('Tenant', this._tenant, tenant);
    }

    this._tenant = tenant;
    console.log('Tenant set:', tenant?.name);
  }

  private logPotentialConflict(type: string, existing: Tenant.selectable, incoming: Tenant.selectable) {
    console.warn(`Potential ${type} Connection Conflict`, {
      existingId: existing.id,
      incomingId: incoming.id,
      requestPath: this._request?.path,
      timestamp: new Date()
    });
  }

  getTenant(): Tenant.selectable | null {
    return this._tenant;
  }

  
  

  clearTenant() {
    this._tenant = null;
    console.log('Tenant and TenantDb cleared');
  }
}

