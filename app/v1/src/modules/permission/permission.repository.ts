import { QueryParams } from '../../common/dto/pagination.dto';
import { PERMISSION_PATH } from './constants';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { TenantDatabase } from '../../tenants/database/database';
import { Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { sql } from 'kysely';
import { PermissionMapper } from './interfaces/permission.interfaces';

export class PermissionRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}
  async createPermission(createPermissionDto: CreatePermissionDto) {
    const createdPermission = await this.tenantDb
      .insertInto(PERMISSION_PATH)
      .values(createPermissionDto)
      .executeTakeFirst();

    return createdPermission;
  }

  async findAllPermissions(queryParams: QueryParams, offset: number) {
    const { limit, sort, search, filter } = queryParams;

    let query = this.tenantDb.selectFrom(PERMISSION_PATH);

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['permissions.name'],
      sort,
      defaultSortField: 'permissions.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(query.select('permissions.id').as('filtered_permissions'))
      .select(sql<number>`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const permissions = await query
      .selectAll()
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(countResult?.count || 0);

    return {
      total,
      docs: permissions ? PermissionMapper.toDomain(permissions) : [],
    };
  }
  async findAllResourcePermissions(queryParams: QueryParams, offset: number) {
    const { limit, sort, search, filter } = queryParams;

    let query = this.tenantDb
      .selectFrom(PERMISSION_PATH)

      .distinctOn('resource')
      .orderBy('resource')
      .where('deleted_at', 'is', null);

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['permissions.resource'],
      sort,
      defaultSortField: 'permissions.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(query.select('permissions.id').as('filtered_permissions'))
      .select(sql<number>`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const permissions = await query
      .select([
        'permissions.id',
        'permissions.resource',
        'permissions.created_at',
        'permissions.updated_at',
        'permissions.deleted_at',
      ])
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(countResult?.count || 0);

    return {
      total,
      docs: permissions ? PermissionMapper.toDomain(permissions) : [],
    };
  }

  async findPermissionById(id: string) {
    return this.tenantDb
      .selectFrom(PERMISSION_PATH)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findPermissionByName(name: string) {
    return this.tenantDb
      .selectFrom(PERMISSION_PATH)
      .selectAll()
      .where('name', '=', name)
      .executeTakeFirst();
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto) {
    return await this.tenantDb
      .updateTable(PERMISSION_PATH)
      .set({ ...updatePermissionDto, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async deletePermission(id: string) {
    return await this.tenantDb
      .updateTable(PERMISSION_PATH)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where('id', '=', id)
      .executeTakeFirst();
  }
  
}
