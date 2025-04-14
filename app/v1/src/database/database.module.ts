import { Module, DynamicModule } from '@nestjs/common';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './database.module-definition';
import { DatabaseOptions } from './database.options';
import { Pool } from 'pg';
import { PostgresDialect, Kysely } from 'kysely';
import { Database } from './database';
import { ConfigurableModuleAsyncOptions } from '@nestjs/common';
import { DB_CONNECTION } from './constants';

@Module({})
export class DatabaseModule extends ConfigurableModuleClass {
  static forRootAsync(options: ConfigurableModuleAsyncOptions<object>): DynamicModule {
    return {
      module: DatabaseModule,
      global: true, // Make the module global
      providers: [
        {
          provide: MODULE_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: Database,
          useFactory: (dbOptions: DatabaseOptions) => {
            const dialect = new PostgresDialect({
              pool: new Pool({
                host: dbOptions.host,
                port: dbOptions.port,
                user: dbOptions.user,
                password: dbOptions.password,
                database: dbOptions.database,
              }),
            });

            return new Database({
              dialect,
            });
          },
          inject: [MODULE_OPTIONS_TOKEN],
        },
        {
          provide: DB_CONNECTION,
          useFactory: (database: Database) => {
            return database; // Return the Database instance directly
          },
          inject: [Database],
        },
      ],
      exports: [Database, DB_CONNECTION],
    };
  }
}
