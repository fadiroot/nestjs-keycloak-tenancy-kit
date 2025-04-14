import { Kysely, sql } from "kysely";
import { ROLE_PERMISSION_TABLE } from "../../../modules/rolePermission/constants";
import { ROLE_TABLE } from "../../../../src/modules/role/constants";

export async function seedRolePermission(db: Kysely<any>) {
    try {
        const tableExists = await db
            .selectFrom('information_schema.tables')
            .select('table_name')
            .where('table_name', '=', ROLE_PERMISSION_TABLE)
            .execute();

        if (tableExists.length === 0) {
            console.log(`Table ${ROLE_PERMISSION_TABLE} does not exist, skipping seeding... `);
            return;
        }

        const roleSuperAdmin = await db
            .selectFrom(ROLE_TABLE)
            .select('id')
            .where('name', '=', 'super-admin')
            .executeTakeFirst();

        if (!roleSuperAdmin) {
            console.log('Super admin role not found');
            return;
        }

        const roleSuperAdminId = roleSuperAdmin.id;

        console.log(`Seeding permissions for Super Admin Role ID: ${roleSuperAdminId}`);

        const permissionsToAssign = await db
            .selectFrom('permissions')
            .select('id')
            .where('id', 'not in',
                eb => eb.selectFrom('role_permission')
                    .where('role_id', '=', roleSuperAdminId)
                    .select('permission_id')
            )
            .execute();

        console.log(`Number of permissions to assign: ${permissionsToAssign.length}`);

        if (permissionsToAssign.length > 0) {
            await db
                .insertInto(ROLE_PERMISSION_TABLE)
                .columns(['role_id', 'permission_id'])
                .values(permissionsToAssign.map(perm => ({
                    role_id: roleSuperAdminId,
                    permission_id: perm.id
                })))
                .execute();

            console.log(`Successfully assigned ${permissionsToAssign.length} permissions to super admin role`);
        }
    } catch (error) {
        console.error('Error in seedRolePermission:', error);
        throw error;
    }
}


