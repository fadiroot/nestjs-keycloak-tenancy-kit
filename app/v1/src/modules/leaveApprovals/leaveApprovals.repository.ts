import { Inject } from '@nestjs/common';
import { TENANT_DB } from '../../tenants/constants';
import { TenantDatabase } from '../../tenants/database/database';
import { CreateLeaveApprovalDto } from './dto/createLeaveApproval.dto';
import { LeaveApprovalsMapper } from './interfaces/leaveApproval.interface';
import { LEAVE_APPROVALS_TABLE } from './leaveApprovals.constants';
import { QueryParams } from '../../common/dto/pagination.dto';
import { QueryBuilderUtility } from '../../common/utils/queryBuilder.util';
import { sql } from 'kysely';
import { UpdateLeaveApprovalDto } from './dto/updateLeaveApproval.dto';

export class LeaveApprovalsRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

  async createLeaveApproval(leaveApprovalDto: CreateLeaveApprovalDto) {
    leaveApprovalDto = LeaveApprovalsMapper.toInsertable(leaveApprovalDto);
    const leaveApproval = await this.tenantDb
      .insertInto(LEAVE_APPROVALS_TABLE)
      .values(leaveApprovalDto)
      .returningAll()
      .executeTakeFirst();

    return LeaveApprovalsMapper.toDomain(leaveApproval);
  }

  async findAllLeaveApprovalsByLeaveId(
    leaveId: string,
    queryParams: QueryParams,
    offset: number
  ) {
    const { limit, sort, search, filter } = queryParams;

    let query = this.tenantDb
      .selectFrom(LEAVE_APPROVALS_TABLE)
      .leftJoin('leaves', 'leaves.id', 'leave_approvals.leave_id')
      .where('leave_approvals.leave_id', '=', leaveId)
      .where('leaves.deleted_at', 'is', null)
      .where('leaves.deleted_at', 'is', null);

    query = QueryBuilderUtility.applyQueryOptions(query, {
      filter,
      allowedFilterFields: [],
      search,
      searchFields: ['leave_approvals.name'],
      sort,
      defaultSortField: 'leave_approvals.created_at',
      defaultSortOrder: 'asc',
    });
    const countQuery = this.tenantDb
      .selectFrom(
        query.select('leave_approvals.leave_id').as('filter_leave_approvals')
      )
      .select(sql<number>`count(*)`.as('count'));

    const countResult = await countQuery.executeTakeFirst();

    const docs = await query
      .select([
        'leave_approvals.reason',
        'leave_approvals.leave_id',
        'leave_approvals.created_at',
        'leave_approvals.updated_at',
        'leave_approvals.deleted_at',
        'leave_approvals.status',
        sql`(SELECT COALESCE(row_to_json(leave_approvals),'{}') FROM users where leave_approvals.approver_id = users.id)`.as(
          'approver'
        ),
      ])
      .offset(offset)
      .limit(limit)
      .execute();
    const total = Number(countResult?.count || 0);
    return {
      docs: docs ? LeaveApprovalsMapper.toDomain(docs) : [],
      total,
    };
  }

  async findAllLeaveApprovalsByLeaveIdWithoutPagination(leaveId: string) {
    const leaveApprovers = await this.tenantDb
      .selectFrom(LEAVE_APPROVALS_TABLE)
      .selectAll()
      .where('leave_id', '=', leaveId)
      .where('deleted_at', 'is', null)
      .execute();
    return leaveApprovers ? LeaveApprovalsMapper.toDomain(leaveApprovers) : [];
  }

  async findLeaveApproval(leaveId: string, approverId: string) {
    const result = await this.tenantDb
      .selectFrom(LEAVE_APPROVALS_TABLE)
      .where('leave_id', '=', leaveId)
      .where('approver_id', '=', approverId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return result ? LeaveApprovalsMapper.toDomain(result) : null;
  }

  async updateLeaveApproval(
    leaveId: string,
    approverId: string,
    leaveApprovalDto: UpdateLeaveApprovalDto
  ) {
    leaveApprovalDto = LeaveApprovalsMapper.toUpdatable(leaveApprovalDto);

    const updatedLeaveApprover = await this.tenantDb
      .updateTable(LEAVE_APPROVALS_TABLE)
      .set({ ...leaveApprovalDto, updated_at: new Date() })
      .returningAll()
      .where('leave_id', '=', leaveId)
      .where('approver_id', '=', approverId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return updatedLeaveApprover
      ? LeaveApprovalsMapper.toDomain(updatedLeaveApprover)
      : null;
  }

  async deleteLeaveApproval(leaveId: string, approverId: string) {
    return await this.tenantDb
      .updateTable(LEAVE_APPROVALS_TABLE)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where('leave_id', '=', leaveId)
      .where('approver_id', '=', approverId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
  }
}
