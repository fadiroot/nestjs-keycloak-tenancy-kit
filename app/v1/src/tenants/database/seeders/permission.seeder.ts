import { Kysely } from 'kysely';
import { Logger } from '@nestjs/common';

const ACTIONS = [
    'create',
    'read',
    'update',
    'delete',
    'list',
    'manage',
] as const;

type PermissionFormat =
    | `${Resource}:${Action}`
    | `${Resource}:*`
    | 'system:admin';

type Resource = string;
type Action = (typeof ACTIONS)[number];

export async function seedPermissions(db: Kysely<any>) {
    const logger = new Logger('PermissionSeeder');

    // Check if permissions table exists
    const tableExists = await db
        .selectFrom('information_schema.tables')
        .select('table_name')
        .where('table_name', '=', 'permissions')
        .execute();

    if (tableExists.length === 0) {
        logger.log('Permissions table does not exist, skipping seeding...');
        return;
    }

    // Get all tables
    const tables = await db
        .selectFrom('information_schema.tables')
        .select('table_name')
        .where('table_schema', '=', 'public')
        .execute();

    let resources = tables.map((row) => row.table_name);

    const resourcesToRemove = [
        'kysely_migration',
        'kysely_migration_lock',
        'permissions',
    ];
    resources = resources.filter((item) => !resourcesToRemove.includes(item));

    const permissions: Array<{ name: PermissionFormat, resource?: string }> = [];

    for (const resource of resources) {
        for (const action of ACTIONS) {
            permissions.push({
                name: `${resource}:${action}` as PermissionFormat,
                resource: resource,
            });
        }

        // Add wildcard permission for each resource
        permissions.push({
            name: `${resource}:*` as PermissionFormat,
            resource: resource,
        });
    }

    // Add system-wide admin permission
    permissions.push({
        name: 'system:admin' as PermissionFormat,
    });

    try {
        await db.transaction().execute(async (trx) => {
            await trx.deleteFrom('permissions').execute();

            for (const permission of permissions) {
                // Ensure resource is not undefined or null before inserting
                if (permission.resource) {
                    await trx
                        .insertInto('permissions')
                        .values({
                            name: permission.name,
                            resource: permission.resource,
                        })
                        .execute();
                } else {
                    logger.warn(
                        `Skipping permission ${permission.name} as resource is missing.`
                    );
                }
            }

            // Insert super-admin role
            await trx
                .insertInto('roles')
                .values({
                    name: 'super-admin',
                    description: 'Super Administrator Role'
                })
                .execute();
        });

        logger.log(`Successfully seeded ${permissions.length} permissions`);
    } catch (error) {
        logger.error('Error seeding permissions:', error);
        throw error;
    }
} 