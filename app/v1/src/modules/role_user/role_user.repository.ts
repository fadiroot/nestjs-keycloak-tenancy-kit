import { ROLE_USER } from './constants';
import { UpdateRoleUserDto } from './dto/update-role_user.dto';
import { CreateRoleUserDto } from './dto/create-role_user.dto';
import { TenantDatabase } from '../../tenants/database/database';
import { Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { sql } from 'kysely';
import { QueryParams } from '../../common/dto/pagination.dto';
import { RoleUserMapper } from './interfaces/role_user.interfaces';

export class RoleUserRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}
  async createRoleUser(createRoleUserDto: CreateRoleUserDto[]) {
    const createdRoleUser = await this.tenantDb
      .insertInto(ROLE_USER)
      .values(createRoleUserDto)
      .returningAll()
      .execute();

    return createdRoleUser;
  }

  async findAllRoleUsers(queryParams: QueryParams, offset: number) {
    const { limit, sort, search, filter } = queryParams;

    let query = this.tenantDb.selectFrom(ROLE_USER);

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      sort,
      defaultSortField: 'role_user.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(query.select('role_user.id').as('filtered_role_user'))
      .select(sql<number>`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const departments = await query
      .selectAll()
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(countResult?.count || 0);

    return {
      total,
      docs: departments ? RoleUserMapper.toDomain(departments) : [],
    };
  }

  async findRoleUserById(id: string) {
    return this.tenantDb
      .selectFrom(ROLE_USER)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async updateRoleUser(id: string, updateRoleUserDto: UpdateRoleUserDto) {
    return await this.tenantDb
      .updateTable(ROLE_USER)
      .set({ ...updateRoleUserDto, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteRoleUser(id: string) {
    return await this.tenantDb
      .updateTable(ROLE_USER)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where('id', '=', id)
      .executeTakeFirst();
  }
}
