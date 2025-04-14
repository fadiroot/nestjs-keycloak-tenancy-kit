import fs from 'fs/promises';
import path from 'path';

function getTimestamp(): string {
  return new Date().toISOString().replace(/[-T:.Z]/g, '');
}

export async function createMigrationFile(description: string): Promise<void> {
  console.log('Starting migration file creation...');
  const timestamp = getTimestamp();
  const filename = `${timestamp}_${description.trim().split(' ').join('_')}.ts`;
  const filePath = path.join(process.cwd(), 'app', 'v1', 'src', 'database', 'migrations', filename);
  console.log(`Attempting to create file: ${filePath}`);
  
  const content = `import { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>) {
  // TODO: Implement migration logic
}

export async function down(db: Kysely<unknown>) {
  // TODO: Implement rollback logic
}
`;

  try {
    await fs.writeFile(filePath, content, { flag: 'wx' });
    console.log(`Migration file created successfully: ${filename}`);
  } catch (error) {
    if ((error as { code: string }).code === 'EEXIST') {
      console.error(`Migration file already exists: ${filename}`);
    } else {
      console.error(
        `Error creating migration file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  const description = process.argv[2];
  if (!description) {
    console.error('Please provide a migration description');
    process.exit(1);
  }
  createMigrationFile(description)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to create migration:', error);
      process.exit(1);
    });
}