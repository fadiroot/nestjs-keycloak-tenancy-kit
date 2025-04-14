import { ROLE_PERMISSION } from './constants';
import { UpdateRolePermissionDto } from './dto/updateRolePermission.dto';
import { CreateRolePermissionDto } from './dto/createrolePermission.dto';
import { TenantDatabase } from '../../tenants/database/database';
import { Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { QueryParams } from '../../common/dto/pagination.dto';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { sql } from 'kysely';
import { RolePermissionMapper } from './interfaces/rolePermission.interfaces';

export class RolePermissionRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}
  async createRolePermission(
    createRolePermissionDto: CreateRolePermissionDto[]
  ) {
    const RolePermissions = RolePermissionMapper.toInsertable(
      createRolePermissionDto
    );
    const createdRolePermission = await this.tenantDb
      .insertInto(ROLE_PERMISSION)
      .values(RolePermissions)
      .returningAll()
      .execute();

    return RolePermissionMapper.toDomain(createdRolePermission);
  }

  async findAllRolePermissions(queryParams: QueryParams, offset: number) {
    const { limit, sort, search, filter } = queryParams;

    let query = this.tenantDb
      .selectFrom(ROLE_PERMISSION)
      .selectAll()
      .where('deleted_at', 'is', null);
    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      sort,
      defaultSortField: 'role_permission.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(
        query.select('role_permission.role_id').as('filtered_role_permission')
      )
      .select(sql<number>`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const rolePermissions = await query.offset(offset).limit(limit).execute();

    const total = Number(countResult?.count || 0);

    return {
      total,
      docs: rolePermissions
        ? RolePermissionMapper.toDomain(rolePermissions)
        : [],
    };
  }

  async findRolePermissionByRoleIdWithPermissionId(
    roleId: string,
    permissionId: string
  ) {
    const rolePermission = await this.tenantDb
      .selectFrom(ROLE_PERMISSION)
      .selectAll()
      .where('role_id', '=', roleId)
      .where('permission_id', '=', permissionId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return rolePermission
      ? RolePermissionMapper.toDomain(rolePermission)
      : null;
  }

  async findAllRolePermissionsByRoleId(roleId: string) {
    const rolePermissions = await this.tenantDb
      .selectFrom(ROLE_PERMISSION)
      .selectAll()
      .where('role_id', '=', roleId)
      .where('deleted_at', 'is', null)
      .execute();
    return rolePermissions
      ? RolePermissionMapper.toDomain(rolePermissions)
      : [];
  }

  async findAllExistingRolePermissions(roleId: string, permissions: string[]) {
    const existingRolePermissions = await this.tenantDb
      .selectFrom(ROLE_PERMISSION)
      .selectAll()
      .where('role_id', '=', roleId)
      .where('permission_id', 'in', permissions)
      .where('deleted_at', 'is', null)
      .execute();
    return existingRolePermissions
      ? RolePermissionMapper.toDomain(existingRolePermissions)
      : [];
  }
  async updateRolePermission(
    roleId: string,
    updateRolePermissionDto: UpdateRolePermissionDto[]
  ) {
    const rolePermissions = RolePermissionMapper.toUpdatable(
      updateRolePermissionDto
    );
    const updatedRolePermission = await this.tenantDb
      .updateTable(ROLE_PERMISSION)
      .set({ ...rolePermissions, updated_at: new Date() })
      .where('role_id', '=', roleId)
      .returningAll()
      .execute();
    return updatedRolePermission
      ? RolePermissionMapper.toDomain(updatedRolePermission)
      : null;
  }

  async deleteRolePermission(roleId: string, permissionId: string) {
    console.log(roleId, permissionId);
    return await this.tenantDb
      .updateTable(ROLE_PERMISSION)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where('role_id', '=', roleId)
      .where('permission_id', '=', permissionId)
      .executeTakeFirst();
  }

  async findPermissionsByRoleId(roleId: string) {
    return await sql`
    select p.name from role_permission rp
    join permissions p on p.id = rp.permission_id 
    join roles r on r.id = rp.role_id
    where rp.role_id = ${roleId} ;
`.execute(this.tenantDb);
  }
}
