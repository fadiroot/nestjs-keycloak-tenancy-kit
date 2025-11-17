import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Tables } from './tables';

export class TenantDatabase extends Kysely<Tables> {
  constructor(config: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  }) {
    super({
      dialect: new PostgresDialect({
        pool: new Pool(config),
      }),
    });
  }
}
