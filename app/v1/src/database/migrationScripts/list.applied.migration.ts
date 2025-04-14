import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Tables } from '../database';
import { Migrator, FileMigrationProvider } from 'kysely';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module'; // Adjust this import path as needed

async function listAppliedMigrations() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const db = new Kysely<Tables>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        user: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs: {
        readdir: (path: string) => Promise.resolve(fs.readdirSync(path)),
      },
      path,
      migrationFolder: path.join(__dirname,'..', 'migrations'),
    }),
  });

  try {
    const results = await migrator.getMigrations();

    if (results instanceof Error) {
      console.error('Error retrieving migrations:', results);
      return;
    }

    console.log('Applied migrations:');
    results.forEach((migration) => {
      if (migration.executedAt) {
        console.log(`- ${migration.name} (executed at ${migration.executedAt})`);
      }
    });

    console.log('\nPending migrations:');
    results.forEach((migration) => {
      if (!migration.executedAt) {
        console.log(`- ${migration.name}`);
      }
    });
  } catch (error) {
    console.error('Error listing migrations:', error);
  } finally {
    await db.destroy();
    await app.close();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  listAppliedMigrations().catch(console.error);
}