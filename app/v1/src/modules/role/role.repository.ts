import { ROLE_PATH, ROLE_TABLE } from './constants';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { TenantDatabase } from '../../tenants/database/database';
import { Inject, Injectable } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { sql } from 'kysely';
import { RoleMapper } from './interfaces/role.interfaces';
import { QueryParams } from '../../common/dto/pagination.dto';

@Injectable()
export class RoleRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

  async createRole(createRoleDto: CreateRoleDto) {
    let role = RoleMapper.toInsertable(createRoleDto)
     role = await this.tenantDb
      .insertInto(ROLE_TABLE)
      .values({
        ...role,
        created_at: new Date(),
      })
      .returningAll()
      .executeTakeFirst();
    return role;
  }

  async findAllRoles(queryParams: QueryParams, offset: number) {
    const { limit, sort, search, filter } = queryParams;

    let query = this.tenantDb
      .selectFrom(`${ROLE_PATH} as r`)
      .leftJoin('users as u', 'r.id', 'u.role_id')
      .groupBy('r.id')
      .where('r.deleted_at', 'is', null)
      .where('u.deleted_at', 'is', null);
    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['r.name'],
      sort,
      defaultSortField: 'r.created_at',
      defaultSortOrder: 'asc',
    });

    const totalResult = await this.tenantDb
      .selectFrom(query.select('r.id').as('filtered_roles'))
      .select(sql<number>`count(*)`.as('count'))
      .executeTakeFirst();

    const roles = await query
      .select([
        'r.id',
        'r.name',
        'r.annual_leave_days',
        'r.description',
        'r.created_at',
        'r.updated_at',
        'r.deleted_at',
        sql`(SELECT count(*) FROM users u WHERE u.role_id = r.id AND u.deleted_at IS NULL)`.as(
          'totalEmployees'
        ),
      ])
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(totalResult?.count || 0);

    return {
      total,
      docs: roles ? RoleMapper.toDomain(roles) : [],
    };
  }

  async findRoleById(id: string) {
    return this.tenantDb
      .selectFrom(ROLE_TABLE)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findRoleByName(name: string) {
    const role = await this.tenantDb
      .selectFrom(ROLE_TABLE)
      .selectAll()
      .where('name', '=', name)
      .executeTakeFirst();

    console.log(role);
    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    let role = RoleMapper.toInsertable(updateRoleDto)
    return await this.tenantDb
      .updateTable(ROLE_PATH)
      .set({ ...role, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteRole(id: string) {
    return await this.tenantDb
      .updateTable(ROLE_PATH)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where('id', '=', id)
      .executeTakeFirst();
  }
}
