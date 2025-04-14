import { Selectable, Insertable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export class LeaveTypeLocationTable {
  location_id: string | null;
  leave_type_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export namespace leaveTypeLocation {
  export type selectable = Selectable<LeaveTypeLocationTable>;
  export type insertable = Insertable<LeaveTypeLocationTable>;
  export type updatable = Updateable<LeaveTypeLocationTable>;
}

export class LeaveTypeLocationMapper extends GenericMapper<
  leaveTypeLocation.selectable,
  leaveTypeLocation.insertable,
  leaveTypeLocation.updatable
> {}
