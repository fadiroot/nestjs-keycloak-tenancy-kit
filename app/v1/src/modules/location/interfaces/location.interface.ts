import { Selectable, Insertable, Updateable } from 'kysely';
import {
  WeekStartOptions,
  LeaveQuotaResetOptions,
  Months,
} from '../enums/location.enums';
import { GenericMapper } from '../../../common/utils/generic-mapper.util';

export interface LocationTable {
  id: string;
  name: string;
  work_week: WeekStartOptions[];
  week_starts_on: WeekStartOptions;
  leave_quota_reset_based_on: LeaveQuotaResetOptions;
  time_zone: string;
  fiscal_year_start_month: Months;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export namespace Location {
  export type selectable = Selectable<LocationTable>;
  export type insertable = Insertable<LocationTable>;
  export type updateable = Updateable<LocationTable>;
}

export class LocationMapper extends GenericMapper<
  Location.selectable,
  Location.insertable,
  Location.updateable
> {}
