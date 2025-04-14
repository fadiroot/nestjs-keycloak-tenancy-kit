import { Injectable, Inject, Logger } from '@nestjs/common';
import { ITenantRepository } from './tenantRepositoryInterface';
import { Tenant, TenantMapper } from '../../database/tenantsTable';
import { TenantDatabaseManager } from '../database/tenantDatabaseManager';
import { DB_CONNECTION } from '../../database/constants';
import { TENANTS_TABLE } from '../constants';

@Injectable()
export class TenantRepository implements ITenantRepository {
  private readonly logger = new Logger(TenantRepository.name);

  constructor(
    @Inject(DB_CONNECTION) private db: any,

    private tenantDatabaseManager: TenantDatabaseManager
  ) {}

  async findByDomain(domain: string) {
    return await this.db
      .selectFrom(TENANTS_TABLE)
      .selectAll()
      .where('domain', '=', domain)
      .executeTakeFirst();
  }

  async findByOrgId(orgId: string): Promise<Tenant.selectable | null> {
    return await this.db
      .selectFrom(TENANTS_TABLE)
      .select(['id' , 'name' , 'host_domain' , 'redirect_url'])
      .where('id', '=', orgId)
      .executeTakeFirst();
      
  }

  async create(tenant: Tenant.insertable): Promise<Tenant.selectable> {
    this.logger.log(`Attempting to create tenant: ${JSON.stringify(tenant)}`);

    const createdTenant = await this.db
      .insertInto(TENANTS_TABLE)
      .values(tenant)
      .returningAll()
      .executeTakeFirstOrThrow();

    this.logger.log(
      `Tenant created successfully: ${JSON.stringify(createdTenant)}`
    );
    return createdTenant;
  }

  async findById(id: string): Promise<Tenant.selectable | null> {
    return await this.db
      .selectFrom(TENANTS_TABLE)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByName(name: string): Promise<Tenant.selectable | null> {
    return await this.db
      .selectFrom(TENANTS_TABLE)
      .selectAll()
      .where('name', '=', name)
      .executeTakeFirst();
  }

  async findByDomainOrName(
    domain: string,
    name: string
  ): Promise<Tenant.selectable | null> {
    return await this.db
      .selectFrom(TENANTS_TABLE)
      .selectAll()
      .where((eb) =>
        eb.or([eb('host_domain', '=', domain), eb('name', '=', name)])
      )
      .executeTakeFirst();
  }

  async update(
    id: string,
    tenantData: Partial<Tenant.updateable>
  ): Promise<Tenant.selectable> {
    const updatedTenantData = TenantMapper.toUpdatable(tenantData);
    this.logger.log(
      `Attempting to update tenant with ID ${id}: ${JSON.stringify(tenantData)}`
    );

    try {
      const updatedTenant = await this.db
        .updateTable(TENANTS_TABLE)
        .set({ updatedTenantData, updated_at: new Date() })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      this.logger.log(
        `Tenant updated successfully: ${JSON.stringify(updatedTenant)}`
      );
      return updatedTenant;
    } catch (error) {
      this.logger.error(`Error updating tenant: ${error}`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Attempting to delete tenant with ID: ${id}`);

    try {
      await this.db.deleteFrom(TENANTS_TABLE).where('id', '=', id).execute();

      this.logger.log(`Tenant with ID ${id} deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting tenant with ID ${id}: ${error}`, error);
      throw error;
    }
  }

  async findAllTenants(): Promise<Tenant.selectable[]> {
    return await this.db.selectFrom(TENANTS_TABLE).selectAll().execute();
  }
}
