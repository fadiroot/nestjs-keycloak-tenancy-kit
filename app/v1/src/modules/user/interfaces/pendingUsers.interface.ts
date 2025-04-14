import { GenericMapper } from "../../..//common/utils/generic-mapper.util";
import { Selectable, Insertable, Updateable } from "kysely";

export interface PendingUserTable {
  id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  gender: 'male' | 'female' | null;
  hire_date:Date,
  organization_id: string;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  social_security_number: string | null;
  mobile_phone_number: string | null;
  work_phone_number: string | null;
  birthday: Date | null;
  employment_status: string | null;
  location_id: string | null;
  home_email: string,
  role_id: string | null;
  department_id: string | null;
  country: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  pay_schedule: 'hour' | 'day' | 'week' | 'month' | 'year' | null;
  per_type: string | null;
  pay_rate: number | null;
  pay_type: string | null;
  street_name: string; // Address street name
  state: string; // Address state or region
  zip: string;
  img_url: string | null;
  job_title: string | null ;
  hire_date_welcome : Date | null ; 
  arrive_time : string ;
  manager: string ; 
  other_instructions : string ;
}

export namespace pending_users {
  export type selectable = Selectable<PendingUserTable>;
  export type insertable = Insertable<PendingUserTable>;
  export type updateable = Updateable<PendingUserTable>;
}
export class PendingUserMapper extends GenericMapper<
pending_users.selectable,
pending_users.insertable,
pending_users.updateable
> {}