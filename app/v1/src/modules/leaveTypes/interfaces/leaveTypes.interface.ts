import { Insertable, Selectable, Updateable } from 'kysely';
import {
  AssignToType,
  YearlyQuotaType,
  YearlyQuotaUnit,
} from '../enums/leaveTypes.enum';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export interface LeaveTypeTable {
  id: string;
  icon: number;
  name: string;
  yearly_quotaT_type: YearlyQuotaType;
  yearly_quota_value: number;
  yearly_quota_unit: YearlyQuotaUnit;
  allow_negative_balance: boolean;
  reason_required: boolean;
  subtract_weekends: boolean;
  assignToType: AssignToType;
  is_all_departments: boolean;
  is_all_locations: boolean;
  default: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export namespace LeaveType {
  export type selectable = Selectable<LeaveTypeTable>;
  export type insertable = Insertable<LeaveTypeTable>;
  export type updatable = Updateable<LeaveTypeTable>;
}

export class LeaveTypeMapper extends GenericMapper<
  LeaveType.selectable,
  LeaveType.insertable,
  LeaveType.updatable
> {}
