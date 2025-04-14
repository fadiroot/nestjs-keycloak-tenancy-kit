import { Insertable, Selectable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export class LeaveTypeSpecialEmployeeTable {
  user_id: string;
  leave_type_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export namespace leaveTypeSpecialEmployee {
  export type selectable = Selectable<LeaveTypeSpecialEmployeeTable>;
  export type insertable = Insertable<LeaveTypeSpecialEmployeeTable>;
  export type updatable = Updateable<LeaveTypeSpecialEmployeeTable>;
}

export class LeaveTypeSpecialEmployeeMapper extends GenericMapper<
  leaveTypeSpecialEmployee.selectable,
  leaveTypeSpecialEmployee.insertable,
  leaveTypeSpecialEmployee.updatable
> {}
