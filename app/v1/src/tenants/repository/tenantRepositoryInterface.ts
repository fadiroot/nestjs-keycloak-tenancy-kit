import { Tenant } from "../../database/tenantsTable";

export interface ITenantRepository {
  findByOrgId(orgId: string): Promise<Tenant.selectable | null>;
  findAllTenants() : Promise<Tenant.selectable[] | null>
  create(tenant: Tenant.insertable): Promise<Tenant.selectable>;
  findByName(name: string): Promise<Tenant.selectable | null>;
  findByDomainOrName(domain:string , name:string):Promise<Tenant.selectable | null>
  findById(id: string):Promise<Tenant.selectable | null>
  update(id:string , tenant: Tenant.updateable):Promise<Tenant.selectable | null>
  delete(id: string): Promise<void>;
  // Add other methods as needed
}
