import { Kysely } from 'kysely';
import { TenantTable } from './tenantsTable';

export interface Tables {
  tenants: TenantTable;
}

export class Database extends Kysely<Tables> {}