import { GenericMapper } from '../../../common/utils/generic-mapper.util';
import { Selectable, Insertable, Updateable } from 'kysely';

// Database table interface
export interface UserTable {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  gender: string | null;
  social_security_number: string | null;
  mobile_phone_number: string | null;
  work_phone_number: string | null;
  home_email: string | null;
  birthday: Date | null;
  hire_date: Date | null;
  employment_status: string;
  organization_id: string | null;
  location_id: string | null;
  role_id: string | null;
  department_id: string | null;
  status: string | null;
  marital_status: string | null;
  email_verified: boolean | null;
  street_name: string | null;
  state: string | null;
  zip: string | null;
  pay_schedule: string | null;
  per_type: string | null;
  pay_rate: number | null;
  pay_type: string | null;
  img_url: string | null;
  job_title: string ; 
  leave_balance: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  is_first_login: boolean | null;
  emergency_contact_id: string | null;
  user_extra_information_id: number | null;
}
export interface UserDomain {
  id: string;
  username: string;
  email: string;
  firstName: string;  
  lastName: string;
  country: string;
  gender: string | null;
  socialSecurityNumber: string | null;
  mobilePhoneNumber: string | null;
  workPhoneNumber: string | null;
  homeEmail: string | null;
  birthday: Date | null;
  hireDate: Date | null;
  employmentStatus: string;
  organizationId: string | null;
  locationId: string | null;
  roleId: string | null;
  departmentId: string | null;
  status: string | null;
  maritalStatus: string | null;
  emailVerified: boolean | null;
  streetName: string | null;
  state: string | null;
  zip: string | null;
  paySchedule: string | null;
  perType: string | null;
  payRate: number | null;
  payType: string | null;
  imgUrl: string | null;
  jobTitle: string;
  leaveBalance: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isFirstLogin: boolean | null;
  emergencyContactId: string | null;
  userExtraInformationId: number | null;
}

export namespace user {
  export type selectable = Selectable<UserTable>;
  export type insertable = Insertable<UserTable>;
  export type updateable = Updateable<UserTable>;
}

export class UserMapper extends GenericMapper<
  user.selectable,
  user.insertable,
  user.updateable
> {
  static readonly DomainType: UserDomain;
}

export interface IUserRequest extends Request {
  user: typeof UserMapper.DomainType;
  token : string

}