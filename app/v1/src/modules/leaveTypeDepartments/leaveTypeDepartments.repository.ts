import { Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { TenantDatabase } from '../../tenants/database/database';
import { CreateLeaveTypeDepartmentDto } from './dto/createLeaveTypeDepartment.dto';
import { LeaveTypeDepartmentMapper } from './interfaces/leaveTypeDepartment.interfaces';
import { LEAVE_TYPE_DEPARTMENTS } from './leaveTypeDepartments.constants';
import { UpdateLeaveTypeDepartmentDto } from './dto/updateLeaveTypeDepartment.dto';
import { sql } from 'kysely';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { QueryParams } from '../../common/dto/pagination.dto';

export class LeaveTypeDepartmentRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

  async createLeaveTypeDepartments(
    leaveTypeDepartmentsDto: CreateLeaveTypeDepartmentDto[]
  ) {
    leaveTypeDepartmentsDto = LeaveTypeDepartmentMapper.toInsertable(
      leaveTypeDepartmentsDto
    );
    const leaveTypeDepartments = await this.tenantDb
      .insertInto(LEAVE_TYPE_DEPARTMENTS)
      .values(leaveTypeDepartmentsDto)
      .returningAll()
      .execute();
    return LeaveTypeDepartmentMapper.toDomain(leaveTypeDepartments);
  }

  async findAllLeaveTypeDepartments(
    leaveTypeId: string,
    queryParams: QueryParams,
    offset: number
  ) {
    const { limit, sort, search, filter } = queryParams;

    let query = this.tenantDb
      .selectFrom(LEAVE_TYPE_DEPARTMENTS)
      .innerJoin(
        'departments',
        'departments.id',
        'leave_type_departments.department_id'
      )

      .where('leave_type_departments.deleted_at', 'is', null)
      .where('leave_type_departments.leave_type_id', '=', leaveTypeId);

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['departments.name'],
      sort,
      defaultSortField: 'leave_type_departments.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(
        query
          .select('leave_type_departments.leave_type_id')
          .as('filtered_leave_type_departments')
      )
      .select(sql<number>`count(*)`.as('count'));

    const countResult = await countQuery.executeTakeFirst();

    const docs = await query
      .select([
        'leave_type_departments.leave_type_id',
        'leave_type_departments.created_at',
        'leave_type_departments.updated_at',
        sql`
      (SELECT COALESCE(row_to_json(d), '{}')
       FROM departments AS d 
       WHERE departments.id = leave_type_departments.department_id
      )`.as('departments'),
      ])
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(countResult?.count || 0);

    return {
      docs: docs ? LeaveTypeDepartmentMapper.toDomain(docs) : [],
      total,
    };
  }

  async findLeaveTypeDepartmentByLeaveTypeId(leaveTypeId: string) {
    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_DEPARTMENTS)
      .where('leave_type_id', '=', leaveTypeId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return result ? LeaveTypeDepartmentMapper.toDomain(result) : null;
  }

  async findLeaveTypeDepartmentByObj(
    leaveTypeDepartment: CreateLeaveTypeDepartmentDto
  ) {
    console.log(leaveTypeDepartment);
    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_DEPARTMENTS)
      .innerJoin(
        'departments',
        'departments.id',
        'leave_type_departments.department_id'
      )
      .select([
        'leave_type_departments.leave_type_id',
        'leave_type_departments.department_id',
        'leave_type_departments.created_at',
        'leave_type_departments.updated_at',
        sql`
        COALESCE(
          (
            SELECT row_to_json(d)
            FROM departments AS d
            WHERE d.id = leave_type_departments.department_id
          ),
          '{}'::json
        )`.as('departments'),
      ])
      .where('leave_type_departments.deleted_at', 'is', null)
      .where((eb: any) =>
        eb.and({
          department_id: leaveTypeDepartment.departmentId,
          leave_type_id: leaveTypeDepartment.leaveTypeId,
        })
      )
      .executeTakeFirst();
    console.log(result);
    return result ? LeaveTypeDepartmentMapper.toDomain(result) : null;
  }

  async findAllLeaveTypeDepartmentsExist(
    createLeaveTypeApproversDto: CreateLeaveTypeDepartmentDto[]
  ) {
    const leaveTypeDepartments = LeaveTypeDepartmentMapper.toInsertable(
      createLeaveTypeApproversDto
    );
    const departmentIds = leaveTypeDepartments.map(
      (item) => item.department_id
    );
    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_DEPARTMENTS)
      .selectAll()
      .where('leave_type_id', '=', createLeaveTypeApproversDto[0].leaveTypeId)
      .where('department_id', 'in', departmentIds)
      .where('deleted_at', 'is', null)
      .execute();
    return result ? LeaveTypeDepartmentMapper.toDomain(result) : null;
  }

  async updateLeaveTypeDepartment(
    leaveTypeId: string,
    departmentId: string,
    updateLeaveTypeDepartmentDto: UpdateLeaveTypeDepartmentDto
  ) {
    let updatedLeaveTypeDepartment = LeaveTypeDepartmentMapper.toUpdatable(
      updateLeaveTypeDepartmentDto
    );
    updatedLeaveTypeDepartment = await this.tenantDb
      .updateTable(LEAVE_TYPE_DEPARTMENTS)
      .set({ ...updatedLeaveTypeDepartment, updated_at: new Date() })
      .where('leave_type_id', '=', leaveTypeId)
      .where('department_id', '=', departmentId)
      .returningAll()
      .executeTakeFirst();

    return updatedLeaveTypeDepartment
      ? LeaveTypeDepartmentMapper.toDomain(updatedLeaveTypeDepartment)
      : null;
  }

  async deleteLeaveTypeDepartment(leaveTypeId: string, departmentId: string) {
    return await this.tenantDb
      .updateTable(LEAVE_TYPE_DEPARTMENTS)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where('leave_type_id', '=', leaveTypeId)
      .where('department_id', '=', departmentId)
      .executeTakeFirst();
  }
}
