import { Selectable, Insertable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export interface LeaveTable {
  id: string;
  user_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  comment: string;
  status: LeaveStatus;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PART_APPROVED = 'part_approved',
  REJECTED = 'rejected',
}

export namespace Leave {
  export type selectable = Selectable<LeaveTable>;
  export type insertable = Insertable<LeaveTable>;
  export type updatable = Updateable<LeaveTable>;
}

export class LeaveMapper extends GenericMapper<
  Leave.selectable,
  Leave.insertable,
  Leave.updatable
> {}
