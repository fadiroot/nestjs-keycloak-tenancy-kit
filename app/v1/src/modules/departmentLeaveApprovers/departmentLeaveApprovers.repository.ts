import { Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { CreateDepartmentLeaveApproverDto } from './dto/createDepartmentLeaveApprover.dto';
import { DepartmentLeaveApproverMapper } from './interfaces/departmentLeaveApprover.interface';
import { DEPARTMENT_LEAVE_APPROVERS } from './departmentLeaveApprovers.constants';
import { TenantDatabase } from '../../tenants/database/database';
import { UpdateDepartmentLeaveApproverDto } from './dto/updateDepartmentLeaveAprover.dto';
import { sql } from 'kysely';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { QueryParams } from '../../common/dto/pagination.dto';

export class DepartmentLeaveApproversRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

  async createDepartmentLeaveApprover(
    createDepartmentLeaveApproverDto:
      | CreateDepartmentLeaveApproverDto[]
      | CreateDepartmentLeaveApproverDto
  ) {
    let departmentLeaveApprover = DepartmentLeaveApproverMapper.toInsertable(
      createDepartmentLeaveApproverDto
    );
    departmentLeaveApprover = await this.tenantDb
      .insertInto(DEPARTMENT_LEAVE_APPROVERS)
      .values(departmentLeaveApprover)
      .returningAll()
      .executeTakeFirst();
    return DepartmentLeaveApproverMapper.toDomain(departmentLeaveApprover);
  }

  async findAllDepartmentLeaveApprovers(
    departmentId: string,
    queryParams: QueryParams,
    offset: number
  ) {
    const { limit, sort, search, filter } = queryParams;

    let query = this.tenantDb
      .selectFrom('department_leave_approvers')
      .innerJoin('users', 'users.id', 'department_leave_approvers.user_id')
      .where('department_leave_approvers.deleted_at', 'is', null)
      .where('department_leave_approvers.department_id', '=', departmentId);

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['users.first_name', 'users.last_name', 'users.email'],
      sort,
      defaultSortField: 'department_leave_approvers.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(
        query
          .select('department_leave_approvers.user_id')
          .as('filtered_department_leave_approvers')
      )
      .select(sql`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const docs = await query
      .select([
        'department_leave_approvers.department_id',
        'department_leave_approvers.created_at',
        'department_leave_approvers.updated_at',
        sql`
      (SELECT COALESCE((json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email)),'{}')
       FROM users AS u
       WHERE u.id = department_leave_approvers.user_id
       LIMIT 3
      )`.as('users'),
      ])
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(countResult?.count || 0);

    return {
      docs: docs ? DepartmentLeaveApproverMapper.toDomain(docs) : [],
      total,
    };
  }

  async findAllDepartmentLeaveApproversExist(
    createDepartmentLeaveApproverDto: CreateDepartmentLeaveApproverDto[]
  ) {
    const departmentLeaveApprover = DepartmentLeaveApproverMapper.toInsertable(
      createDepartmentLeaveApproverDto
    );
    const userIds = departmentLeaveApprover.map((item) => item.user_id);

    const result = await this.tenantDb
      .selectFrom(DEPARTMENT_LEAVE_APPROVERS)
      .selectAll()
      .where('department_id', '=', departmentLeaveApprover[0].department_id)
      .where('user_id', 'in', userIds)
      .where('deleted_at', 'is', null)
      .execute();

    return result ? DepartmentLeaveApproverMapper.toDomain(result) : null;
  }

  async findAllDepartmentLeaveApproversByDepartmentId(departmentId: string) {
    const result = await this.tenantDb
      .selectFrom(DEPARTMENT_LEAVE_APPROVERS)
      .selectAll()
      .where('department_id', '=', departmentId)
      .where('deleted_at', 'is', null)
      .execute();
    return result ? DepartmentLeaveApproverMapper.toDomain(result) : [];
  }

  async findDepartmentLeaveApproverByObj(
    departmentLeaveApprover: CreateDepartmentLeaveApproverDto
  ) {
    const result = await this.tenantDb
      .selectFrom(DEPARTMENT_LEAVE_APPROVERS)
      .selectAll()
      .where((eb: any) =>
        eb.and({
          user_id: departmentLeaveApprover.userId,
          department_id: departmentLeaveApprover.departmentId,
        })
      )
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result ? DepartmentLeaveApproverMapper.toDomain(result) : null;
  }

  async updateDepartmentLeaveApprover(
    departmentId: string,
    userId: string,
    updateDepartmentLeaveApproverDto: UpdateDepartmentLeaveApproverDto
  ) {
    const updateDepartmentLeaveApprover =
      DepartmentLeaveApproverMapper.toUpdatable(
        updateDepartmentLeaveApproverDto
      );
    const result = await this.tenantDb
      .updateTable(DEPARTMENT_LEAVE_APPROVERS)
      .set({ ...updateDepartmentLeaveApprover, updated_at: new Date() })
      .where('department_id', '=', departmentId)
      .where('user_id', '=', userId)
      .returningAll()
      .executeTakeFirst();
    return result ? DepartmentLeaveApproverMapper.toDomain(result) : null;
  }
  async deleteDepartmentLeaveApprover(departmentId: string, userId: string) {
    return await this.tenantDb
      .updateTable(DEPARTMENT_LEAVE_APPROVERS)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where('department_id', '=', departmentId)
      .where('user_id', '=', userId)
      .executeTakeFirst();
  }
}
