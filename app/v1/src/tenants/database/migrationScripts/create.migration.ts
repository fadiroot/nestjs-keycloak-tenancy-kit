import fs from 'fs/promises';
import path from 'path';

function getTimestamp(): string {
  return new Date().toISOString().replace(/[-T:.Z]/g, '');
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(
      `Error ensuring directory exists: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

export async function createMigrationFile(description: string): Promise<void> {
  console.log('Starting migration file creation...');
  const dirPath = path.join(
    process.cwd(),
    'app',
    'v1',
    'src',
    'tenants',
    'database',
    'migrations'
  );

  console.log(`Ensuring directory exists: ${dirPath}`);
  await ensureDirectoryExists(dirPath);

  const content = `import { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>) {
  // TODO: Implement migration logic
}

export async function down(db: Kysely<unknown>) {
  // TODO: Implement rollback logic
}
`;

  try {
    const files = await fs.readdir(dirPath);

    // Filter and sort migration files
    const sortedFiles = files
      .filter((file) => /^\d+_.+\.ts$/.test(file)) // Only include valid migration files
      .sort();

    console.log('Sorted existing files:', sortedFiles);

    // Ensure the new file name is unique
    const timestamp = getTimestamp();
    const baseFilename = `${timestamp}_${description.trim().split(' ').join('_')}.ts`;
    const filePath = path.join(dirPath, baseFilename);

    // Check for existing files with the same description (ignore timestamp differences)
    const hasDuplicate = sortedFiles.some((file) =>
      file.includes(`_${description.trim().split(' ').join('_')}.ts`)
    );
    if (hasDuplicate) {
      console.error(
        `Migration file with description "${description}" already exists.`
      );
      return;
    }

    // Create the new migration file
    await fs.writeFile(filePath, content, { flag: 'wx' });
    console.log(`Migration file created successfully: ${baseFilename}`);
  } catch (error) {
    console.error(
      `Error creating migration file: ${error instanceof Error ? error.message : String(error)}`
    );
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
