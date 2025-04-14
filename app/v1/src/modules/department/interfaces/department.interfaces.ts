import { Selectable, Insertable, Updateable } from 'kysely';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';
import { ApproverType } from '../enums/department.enum';

export interface DepartmentTable {
  id: string;
  name: string;
  is_default: boolean;
  approver_type: ApproverType;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export namespace Department {
  export type selectable = Selectable<DepartmentTable>;
  export type insertable = Insertable<DepartmentTable>;
  export type updatable = Updateable<DepartmentTable>;
}

export class DepartmentMapper extends GenericMapper<
  Department.selectable,
  Department.insertable,
  Department.updatable
> {}
