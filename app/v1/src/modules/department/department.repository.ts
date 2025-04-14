import { DEPARTMENT } from './department.constants';
import { UpdateDepartmentDto } from './dto/updateDepartment.dto';
import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { TenantDatabase } from '../../tenants/database/database';
import { Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { DepartmentMapper } from './interfaces/department.interfaces';
import { sql } from 'kysely';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { QueryParams } from '../../common/dto/pagination.dto';
import { DEPARTMENT_LEAVE_APPROVERS } from '../departmentLeaveApprovers/departmentLeaveApprovers.constants';

export class DepartmentRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}
  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    let department = DepartmentMapper.toInsertable(createDepartmentDto);
    department = await this.tenantDb
      .insertInto(DEPARTMENT)
      .values(department)
      .returningAll()
      .executeTakeFirst();
    return DepartmentMapper.toDomain(department);
  }

  async findAllForStat() {
    const departments = await this.tenantDb
      .selectFrom(DEPARTMENT)
      .select(['id', 'name'])
      .where('deleted_at', 'is', null)
      .execute();
    return departments;
  }

  async findAllDepartments(queryParams: QueryParams, offset: number) {
    const { limit, sort, search, filter } = queryParams;
    let query = this.tenantDb
      .selectFrom(DEPARTMENT)
      .where('deleted_at', 'is', null);

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['departments.name'],
      sort,
      defaultSortField: 'departments.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(query.select('departments.id').as('filtered_departments'))
      .select(sql<number>`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const departments = await query
      .select((eb) => [
        sql`
        (SELECT COALESCE(json_agg(json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email)),'[]')
         FROM (SELECT id, first_name, last_name, email
               FROM users
               WHERE department_id = departments.id
               ORDER BY created_at ASC
               LIMIT 3) u
        )`.as('users'),

        eb
          .selectFrom('users')
          .select(sql<number>`count(*)`.as('total_users'))
          .whereRef('department_id', '=', 'departments.id')
          .as('total_users'),

        sql`
        (SELECT COALESCE(json_agg(json_build_object('id', ua.id, 'first_name', ua.first_name, 'last_name', ua.last_name, 'email', ua.email)),'[]')
         FROM (SELECT u.id, u.first_name, u.last_name, u.email
               FROM department_leave_approvers AS da
               JOIN users AS u ON da.user_id = u.id
               WHERE da.department_id = departments.id
               ORDER BY da.created_at ASC
               LIMIT 3) ua
        )`.as('approvers'),

        eb
          .selectFrom('department_leave_approvers')
          .select(sql<number>`count(*)`.as('total_approvers'))
          .whereRef('department_id', '=', 'departments.id')
          .as('total_approvers'),
      ])
      .selectAll()
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(countResult?.count || 0);

    return {
      total,
      docs: departments ? DepartmentMapper.toDomain(departments) : [],
    };
  }
  async findAllDepartmentsExists(ids: string[]) {
    return await this.tenantDb
      .selectFrom(DEPARTMENT)
      .selectAll()
      .where('id', '=', ids)
      .where('deleted_at', 'is', null)
      .execute();
  }
  async findAllDepartmentsIds() {
    const result = await this.tenantDb
      .selectFrom(DEPARTMENT)
      .select(['id'])
      .where('deleted_at', 'is', null)
      .execute();
    return result.map((row) => row.id);
  }

  async findDepartmentById(id: string) {
    const result = await this.tenantDb
      .selectFrom(DEPARTMENT)
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result ? DepartmentMapper.toDomain(result) : null;
  }

  async findDepartmentByName(name: string) {
    const result = await this.tenantDb
      .selectFrom(DEPARTMENT)
      .selectAll()
      .where('name', '=', name)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result ? DepartmentMapper.toDomain(result) : null;
  }

  async updateDepartment(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const UpdatedDepartment = DepartmentMapper.toUpdatable(updateDepartmentDto);
    const result = await this.tenantDb
      .updateTable(DEPARTMENT)
      .set({ ...UpdatedDepartment, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result ? DepartmentMapper.toDomain(result) : null;
  }

  async deleteDepartment(id: string) {
    return await this.tenantDb.transaction().execute(async (trx) => {
      await trx
        .updateTable(DEPARTMENT)
        .set({ deleted_at: new Date(), updated_at: new Date() })
        .where('id', '=', id)
        .executeTakeFirst();

      await trx
        .updateTable(DEPARTMENT_LEAVE_APPROVERS)
        .set({ deleted_at: new Date(), updated_at: new Date() })
        .where('department_id', '=', id)
        .execute();
    });
  }
}
