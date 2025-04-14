import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { GenericMapper } from '../common/utils/generic-mapper.util';

export interface TenantTable {
  id: Generated<string>;
  name: string;
  host_domain: string;
  db_name: string;
  db_user: string;
  db_password: string;
  db_port: number;
  redirect_url: string;
  alias: string;
}

export namespace Tenant {
  export type selectable = Selectable<TenantTable>;
  export type insertable = Insertable<TenantTable>;
  export type updateable = Updateable<TenantTable>;
}

export class TenantMapper extends GenericMapper<
  Tenant.selectable,
  Tenant.insertable,
  Tenant.updateable
> {}
