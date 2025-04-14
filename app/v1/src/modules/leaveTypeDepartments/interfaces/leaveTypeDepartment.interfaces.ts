import { Selectable, Insertable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export class LeaveTypeDepartmentTable {
  department_id: string;
  leave_type_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export namespace leaveTypeDepartment {
  export type selectable = Selectable<LeaveTypeDepartmentTable>;
  export type insertable = Insertable<LeaveTypeDepartmentTable>;
  export type updatable = Updateable<LeaveTypeDepartmentTable>;
}

export class LeaveTypeDepartmentMapper extends GenericMapper<
  leaveTypeDepartment.insertable,
  leaveTypeDepartment.selectable,
  leaveTypeDepartment.updatable
> {}
