import { Insertable, Selectable, Updateable } from 'kysely';
import { LeaveApprovalsStatus } from '../enums/leaveApprovals.enum';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export class LeaveApprovalsTable {
  leave_id: string;
  approver_id: string;
  reason: string;
  status: LeaveApprovalsStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export namespace LeaveApprovals {
  export type selectable = Selectable<LeaveApprovalsTable>;
  export type insertable = Insertable<LeaveApprovalsTable>;
  export type updatable = Updateable<LeaveApprovalsTable>;
}

export class LeaveApprovalsMapper extends GenericMapper<
  LeaveApprovals.selectable,
  LeaveApprovals.insertable,
  LeaveApprovals.updatable
> {}
