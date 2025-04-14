import { LEAVE_TABLE } from './leave.constants';
import { UpdateLeaveDto } from './dto/updateLeave.dto';
import { CreateLeaveDto } from './dto/createLeave.dto';
import { TenantDatabase } from '../../tenants/database/database';
import { Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { sql } from 'kysely';
import { Leave, LeaveMapper } from './interfaces/leave.interfaces';
import { QueryParams } from '../../common/dto/pagination.dto';
import { UpdateStatusLeave } from './dto/updateStatusLeave.dto';

export class LeaveRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}
  async createLeave(createLeaveDto: CreateLeaveDto) {
    const leave = LeaveMapper.toInsertable(createLeaveDto);
    const createdLeave = await this.tenantDb
      .insertInto(LEAVE_TABLE)
      .values(leave)
      .returningAll()
      .executeTakeFirst();
    return LeaveMapper.toDomain(createdLeave);
  }

  async findAllLeaves(
    userId: string,
    queryParams: QueryParams,
    offset: number
  ) {
    const { limit, sort, search, filter } = queryParams;

    let baseQuery = this.tenantDb
      .selectFrom(`${LEAVE_TABLE} as l`)
      .innerJoin('leave_types as lt', 'l.leave_type_id', 'lt.id')
      .where('l.deleted_at', 'is', null)
      .where('l.user_id', '=', userId);

    const filteredQuery = QueryBuilderUtility.applyQueryOptions(baseQuery, {
      filter,
      allowedFilterFields: [
        'l.start_date',
        'l.end_date',
        'l.status',
        'l.created_at',
        'l.updated_at',
      ],
      search,
      searchFields: ['l.start_date', 'l.end_date'],
      sort,
      defaultSortField: 'l.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(filteredQuery.select('l.id').as('filtered_leaves'))
      .select(sql`count(*)`.as('count'));

    const countResult = await countQuery.executeTakeFirst();
    const dataQuery = filteredQuery
      .select([
        'l.id',
        'l.user_id',
        'l.start_date',
        'l.end_date',
        'l.comment',
        'l.status',
        'l.created_at',
        'l.updated_at',
        'l.deleted_at',
        sql`json_build_object(
          'id', lt.id,
          'name', lt.name,
          'icon', lt.icon,
          'yearly_quota_unit', lt.yearly_quota_unit
        )`.as('leave_type'),
      ])
      .offset(offset)
      .limit(limit);

    const leaves = await dataQuery.execute();

    const total = Number(countResult?.count || 0);

    return {
      total,
      docs: leaves ? LeaveMapper.toDomain(leaves) : [],
    };
  }

  async findAllLeavesByApprover(
    userId: string,
    queryParams: QueryParams,
    offset: number
  ) {
    const { limit, sort, search, filter } = queryParams;

    const baseQuery = this.tenantDb
      .selectFrom('leaves as l')
      .innerJoin('users as u', 'l.user_id', 'u.id')
      .innerJoin('leave_types as lt', 'l.leave_type_id', 'lt.id')
      .where('l.deleted_at', 'is', null)
      .where((eb) =>
        eb.exists(
          this.tenantDb
            .selectFrom('department_leave_approvers as dla')
            .select('dla.department_id')
            .where(
              sql`dla.department_id::uuid`,
              '=',
              sql`u.department_id::uuid`
            )
            .where('dla.user_id', '=', userId)
        )
      );

    const filteredQuery = QueryBuilderUtility.applyQueryOptions(baseQuery, {
      filter,
      allowedFilterFields: [
        'l.start_date',
        'l.end_date',
        'l.status',
        'l.created_at',
        'l.updated_at',
      ],
      search,
      searchFields: ['l.start_date', 'l.end_date'],
      sort,
      defaultSortField: 'l.created_at',
      defaultSortOrder: 'asc',
    });

    const countQuery = this.tenantDb
      .selectFrom(filteredQuery.select('l.id').as('filtered_leaves'))
      .select(sql`count(*)`.as('count'));

    const dataQuery = filteredQuery
      .select([
        'l.id',
        'l.start_date',
        'l.end_date',
        'l.comment',
        'l.status',
        'l.created_at',
        'l.updated_at',
        'l.deleted_at',
        sql<string>`json_build_object(
          'id', lt.id,
          'name', lt.name,
          'icon', lt.icon,
          'yearly_quota_unit', lt.yearly_quota_unit
        )`.as('leave_type'),
        sql<string>`json_build_object(
          'id', u.id,
          'username', u.username,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'img_url', u.img_url
        )`.as('user'),
      ])
      .offset(offset)
      .limit(limit);

    const [totalResult, leaves] = await Promise.all([
      countQuery.executeTakeFirst(),
      dataQuery.execute(),
    ]);

    const total = Number(totalResult?.count || 0);

    return {
      total,
      docs: leaves ? LeaveMapper.toDomain(leaves) : [],
    };
  }

  async hasAccess(leave: Leave.selectable, userId: string) {
    leave = LeaveMapper.toInsertable(leave);

    const queryResult = await this.tenantDb
      .selectFrom('leaves as l')
      .select(sql<number>`count(l.id)`.as('count'))
      .innerJoin('users as u', 'l.user_id', 'u.id')
      .where('l.id', '=', leave.id)
      .where('l.deleted_at', 'is', null)
      .where((eb) =>
        eb.exists(
          this.tenantDb
            .selectFrom('department_leave_approvers as dla')
            .select('dla.department_id')
            .where(
              sql`dla.department_id::uuid`,
              '=',
              sql`u.department_id::uuid`
            )
            .where('dla.user_id', '=', userId)
        )
      )
      .executeTakeFirst();
    return queryResult.count;
  }

  async findLeaveById(id: string) {
    const leave = await this.tenantDb
      .selectFrom(`${LEAVE_TABLE} as l`)
      .select([
        'l.id',
        'l.user_id',
        'l.start_date',
        'l.end_date',
        'l.comment',
        'l.status',
        'l.created_at',
        'l.updated_at',
        'l.deleted_at',
        sql`json_build_object(
          'id', lt.id,
          'name', lt.name,
          'icon', lt.icon,
          'yearly_quota_unit', lt.yearly_quota_unit,
          'subtract_weekends',subtract_weekends,
          'allow_negative_balance',allow_negative_balance
        )`.as('leave_type'),
        sql<string>`json_build_object(
          'id', u.id,
          'username', u.username,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'img_url', u.img_url,
          'department_id',u.department_id
        )`.as('user'),
      ])
      .innerJoin('leave_types as lt', 'l.leave_type_id', 'lt.id')
      .leftJoin('users as u', 'l.user_id', 'u.id')
      .where('l.id', '=', id)
      .where('l.deleted_at', 'is', null)
      .executeTakeFirst();
    return leave ? LeaveMapper.toDomain(leave) : null;
  }

  async updateLeave(
    id: string,
    updateLeaveDto: UpdateLeaveDto | UpdateStatusLeave
  ) {
    const leave = LeaveMapper.toUpdatable(updateLeaveDto);
    const result = await this.tenantDb
      .updateTable(LEAVE_TABLE)
      .set({ ...leave, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return result ? LeaveMapper.toDomain(result) : null;
  }

  async deleteLeave(id: string) {
    return await this.tenantDb
      .deleteFrom(LEAVE_TABLE)
      .where('id', '=', id)
      .executeTakeFirst();
  }
}
