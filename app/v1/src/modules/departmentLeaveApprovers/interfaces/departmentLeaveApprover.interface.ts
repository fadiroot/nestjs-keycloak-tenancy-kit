import { Insertable, Selectable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export class DepartmentLeaveApproverTable {
  user_id: string;
  department_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export namespace DepartmentLeaveApprovers {
  export type selectable = Selectable<DepartmentLeaveApproverTable>;
  export type insertable = Insertable<DepartmentLeaveApproverTable>;
  export type updatable = Updateable<DepartmentLeaveApproverTable>;
}

export class DepartmentLeaveApproverMapper extends GenericMapper<
  DepartmentLeaveApprovers.selectable,
  DepartmentLeaveApprovers.insertable,
  DepartmentLeaveApprovers.updatable
> {}
