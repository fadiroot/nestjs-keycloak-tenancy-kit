import { Inject, Injectable } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { TenantDatabase } from '../../tenants/database/database';
import { CreateLeaveTypeDto } from './dto/createLeaveTypes.dto';
import { UpdateLeaveTypeDto } from './dto/updateLeaveTypes.dto';
import { LeaveTypeMapper } from './interfaces/leaveTypes.interface';
import { LEAVE_TYPE_TABLE } from './leaveTypes.constants';
import { sql } from 'kysely';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { QueryParams } from '../../common/dto/pagination.dto';
import { LEAVE_TYPE_DEPARTMENTS } from '../leaveTypeDepartments/leaveTypeDepartments.constants';
import { LEAVE_TYPE_LOCATIONS } from '../leaveTypeLocations/leaveTypeLocations.constants';

@Injectable()
export class LeaveTypesRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}
  async createLeaveType(createLeaveTypeDto: CreateLeaveTypeDto) {
    let leaveType = LeaveTypeMapper.toInsertable(createLeaveTypeDto);
    leaveType = await this.tenantDb
      .insertInto(LEAVE_TYPE_TABLE)
      .values(leaveType)
      .returningAll()
      .executeTakeFirst();
    return LeaveTypeMapper.toDomain(leaveType);
  }
  async findAllLeaveTypes(queryParams: QueryParams, offset: number) {
    const { limit, sort, search, filter } = queryParams;

    let query = this.tenantDb
      .selectFrom(LEAVE_TYPE_TABLE)
      .where('deleted_at', 'is', null);

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['leave_types.name'],
      sort,
      defaultSortField: 'leave_types.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(query.select('leave_types.id').as('filtered_leave_types'))
      .select(sql<number>`count(*)`.as('count'));
    const countResult = await countQuery.executeTakeFirst();

    const leaveTypes = await query
      .selectAll()
      .offset(offset)
      .limit(limit)
      .execute();
    const total = Number(countResult?.count || 0);

    return {
      docs: leaveTypes ? LeaveTypeMapper.toDomain(leaveTypes) : [],
      total,
    };
  }

  async findLeaveTypeById(id: string) {
    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_TABLE)
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result ? LeaveTypeMapper.toDomain(result) : null;
  }

  async findLeaveTypeByObj(field: any, operation: any, value: string) {
    const result = await this.tenantDb
      .selectFrom(LEAVE_TYPE_TABLE)
      .selectAll()
      .where(field, operation, value)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return result ? LeaveTypeMapper.toDomain(result) : null;
  }

  async updateLeaveType(id: string, updateLeaveTypeDto: UpdateLeaveTypeDto) {
    const updatedLeaveType = LeaveTypeMapper.toUpdatable(updateLeaveTypeDto);
    const result = await this.tenantDb
      .updateTable(LEAVE_TYPE_TABLE)
      .set({ ...updatedLeaveType, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result ? LeaveTypeMapper.toDomain(result) : null;
  }

  async deleteLeaveType(id: string) {
    return await this.tenantDb.transaction().execute(async (trx) => {
      await trx
        .updateTable(LEAVE_TYPE_TABLE)
        .set({ deleted_at: new Date(), updated_at: new Date() })
        .where('id', '=', id)
        .executeTakeFirst();

      await trx
        .updateTable(LEAVE_TYPE_DEPARTMENTS)
        .set({ deleted_at: new Date(), updated_at: new Date() })
        .where('leave_type_id', '=', id)
        .execute();

      await trx
        .updateTable(LEAVE_TYPE_LOCATIONS)
        .set({ deleted_at: new Date(), updated_at: new Date() })
        .where('leave_type_id', '=', id)
        .execute();
    });
  }
}
