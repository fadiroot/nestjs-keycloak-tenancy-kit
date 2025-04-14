import { Inject } from '@nestjs/common';
import { sql } from 'kysely';
import { QueryParams } from '../../common/dto/pagination.dto';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { TENANT_DB } from '../../tenants/constants';
import { TenantDatabase } from '../../tenants/database/database';
import { CreateLeaveTypeSpecialEmployeeDto } from './dto/createLeaveTypeSpecialEmployee.dto';
import { UpdateLeaveTypeSpecialEmployeeDto } from './dto/updateLeaveTypeSpecialEmployee.dto';
import { LeaveTypeSpecialEmployeeMapper } from './interfaces/leaveTypeSpecialEmployee.interface';
import { LEAVE_TYPE_SPECIAL_EMPLOYEES } from './leaveTypeSpecialEmployees.constants';

export class LeaveTypeSpecialEmployeesRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

  async createLeaveTypeSpecialEmployees(
    createLeaveTypeSpecialEmployeesDto:
      | CreateLeaveTypeSpecialEmployeeDto[]
      | CreateLeaveTypeSpecialEmployeeDto
  ) {
    let leaveTypeSpecialEmployees = LeaveTypeSpecialEmployeeMapper.toInsertable(
      createLeaveTypeSpecialEmployeesDto
    );
    leaveTypeSpecialEmployees = await this.tenantDb
      .insertInto(LEAVE_TYPE_SPECIAL_EMPLOYEES)
      .values(leaveTypeSpecialEmployees)
      .returningAll()
      .executeTakeFirst();
    return LeaveTypeSpecialEmployeeMapper.toDomain(leaveTypeSpecialEmployees);
  }

  async findAllLeaveTypeSpecialEmployees(
    leaveTypeId: string,
    queryParams: QueryParams,
    offset: number
  ) {
    const { limit, sort, search, filter } = queryParams;

    // Start query builder for leave type specialEmployees
    let query = this.tenantDb
      .selectFrom(LEAVE_TYPE_SPECIAL_EMPLOYEES)
      .innerJoin('users', 'users.id', 'leave_type_special_employees.user_id')
      .where('leave_type_special_employees.leave_type_id', '=', leaveTypeId)
      .where('leave_type_special_employees.deleted_at', 'is', null);

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['users.first_name', 'users.last_name', 'users.email'],
      sort,
      defaultSortField: 'leave_type_special_employees.created_at',
      defaultSortOrder: 'asc',
    });
    const countQuery = this.tenantDb
      .selectFrom(
        query
          .select('leave_type_special_employees.leave_type_id')
          .as('filtered_leave_type_special_employees')
      )
      .select(sql<number>`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const docs = await query
      .select([
        'leave_type_special_employees.leave_type_id',
        'leave_type_special_employees.created_at',
        'leave_type_special_employees.updated_at',
        sql`
        (SELECT COALESCE((json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email)),'{}')
               FROM users AS u
               WHERE u.id = leave_type_special_employees.user_id
               LIMIT 3
              )`.as('users'),
      ])
      .offset(offset)
      .limit(limit)
      .execute();

    const total = Number(countResult?.count || 0);

    return {
      docs: docs ? LeaveTypeSpecialEmployeeMapper.toDomain(docs) : [],
      total,
    };
  }

  async findAllLeaveTypeSpecialEmployeesExist(
    createLeaveTypeSpecialEmployeesDto: CreateLeaveTypeSpecialEmployeeDto[]
  ) {
    const leaveTypeSpecialEmployees =
      LeaveTypeSpecialEmployeeMapper.toInsertable(
        createLeaveTypeSpecialEmployeesDto
      );
    const userIds = leaveTypeSpecialEmployees.map((item) => item.user_id);

    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_SPECIAL_EMPLOYEES)
      .selectAll()
      .where('leave_type_id', '=', leaveTypeSpecialEmployees[0].leave_type_id)
      .where('user_id', 'in', userIds)
      .where('deleted_at', 'is', null)
      .execute();

    return result ? LeaveTypeSpecialEmployeeMapper.toDomain(result) : null;
  }

  async findLeaveTypeSpecialEmployeeByLeaveTypeId(leaveTypeId: string) {
    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_SPECIAL_EMPLOYEES)
      .selectAll()
      .where('leave_type_id', '=', leaveTypeId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result ? LeaveTypeSpecialEmployeeMapper.toDomain(result) : null;
  }

  async findLeaveTypeSpecialEmployeeByObj(
    leaveTypeSpecialEmployee: CreateLeaveTypeSpecialEmployeeDto
  ) {
    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_SPECIAL_EMPLOYEES)
      .selectAll()
      .where((eb) =>
        eb.and({
          user_id: leaveTypeSpecialEmployee.userId,
          leave_type_id: leaveTypeSpecialEmployee.leaveTypeId,
        })
      )
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result ? LeaveTypeSpecialEmployeeMapper.toDomain(result) : null;
  }

  async updateLeaveTypeSpecialEmployee(
    leaveTypeId: string,
    userId: string,
    updateLeaveTypeSpecialEmployeeDto: UpdateLeaveTypeSpecialEmployeeDto
  ) {
    const updateLeaveTypeSpecialEmployee =
      LeaveTypeSpecialEmployeeMapper.toUpdatable(
        updateLeaveTypeSpecialEmployeeDto
      );
    const result = await this.tenantDb
      .updateTable(LEAVE_TYPE_SPECIAL_EMPLOYEES)
      .set({ ...updateLeaveTypeSpecialEmployee, updated_at: new Date() })
      .where('leave_type_id', '=', leaveTypeId)
      .where('user_id', '=', userId)
      .returningAll()
      .executeTakeFirst();
    return result ? LeaveTypeSpecialEmployeeMapper.toDomain(result) : null;
  }

  async deleteLeaveTypeSpecialEmployee(leaveTypeId: string, userId: string) {
    return await this.tenantDb
      .updateTable(LEAVE_TYPE_SPECIAL_EMPLOYEES)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where('leave_type_id', '=', leaveTypeId)
      .where('user_id', '=', userId)
      .executeTakeFirst();
  }
}
