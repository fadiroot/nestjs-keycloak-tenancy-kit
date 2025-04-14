import { PermissionTable } from '../../modules/permission/interfaces/permission.interfaces';
import { RoleTable } from '../../modules/role/interfaces/role.interfaces';
import { RolePermissionTable } from '../../modules/rolePermission/interfaces/rolePermission.interfaces';
import { DepartmentTable } from '../../modules/department/interfaces/department.interfaces';
import { RoleUserTable } from '../../modules/role_user/interfaces/role_user.interfaces';
import { DepartmentLeaveApproverTable } from '../../modules/departmentLeaveApprovers/interfaces/departmentLeaveApprover.interface';
import { LocationTable } from '../../modules/location/interfaces/location.interface';
import { UserTable } from '../../modules/user/interfaces/user.interface';
import { PendingUserTable } from '../../modules/user/interfaces/pendingUsers.interface';
import { LeaveTypeTable } from '../../modules/leaveTypes/interfaces/leaveTypes.interface';
import { LeaveTable } from '../../modules/leave/interfaces/leave.interfaces';
import { LeaveTypeLocationTable } from '../../modules/leaveTypeLocations/interfaces/leaveTypeLocation.interface';
import { LeaveTypeDepartmentTable } from '../../modules/leaveTypeDepartments/interfaces/leaveTypeDepartment.interfaces';
import { LeaveTypeSpecialEmployeeTable } from '../../modules/leaveTypeSpecialEmployees/interfaces/leaveTypeSpecialEmployee.interface';
import { EducationTable } from '../../modules/user/interfaces/education.interface';
import { EmergencyContactTable } from '../../modules/user/interfaces/emergencyContact.interface';
import { UserVisaTable } from '../../modules/user/interfaces/userVisa.interface';
import { UserExtraInformationTable } from '../../modules/user/interfaces/userExtraInformation.interface';
import { SocialLinkTypesTable } from '../../modules/user/interfaces/socialLinkTypes';
import { UserSocialLinksTable } from '../../modules/user/interfaces/userSocialLinks.interface';
import { JobTitleTable } from '../../modules/user/interfaces/jobTitle.interface';
import { EmployeeContactTable } from '../../modules/user/interfaces/employeeContact.interface';
import { UploadedFilesTable } from '../../modules/uploadedFiles/interfaces/uploadedFile.interface';
import {
  LeaveApprovals,
  LeaveApprovalsTable,
} from '../../modules/leaveApprovals/interfaces/leaveApproval.interface';

export interface Tables {
  permissions: PermissionTable;
  roles: RoleTable;
  role_permission: RolePermissionTable;
  role_user: RoleUserTable;
  users: UserTable;
  departments: DepartmentTable;
  department_leave_approvers: DepartmentLeaveApproverTable;
  locations: LocationTable;
  pending_users: PendingUserTable;
  leave_types: LeaveTypeTable;
  leave_type_locations: LeaveTypeLocationTable;
  leave_type_departments: LeaveTypeDepartmentTable;
  leave_type_special_employees: LeaveTypeSpecialEmployeeTable;
  leaves: LeaveTable;
  user_education: EducationTable;
  emergency_contacts: EmergencyContactTable;
  user_visa: UserVisaTable;
  user_extra_information: UserExtraInformationTable;
  social_link_types: SocialLinkTypesTable;
  user_social_links: UserSocialLinksTable;
  job_titles: JobTitleTable;
  employee_contacts: EmployeeContactTable;
  uploaded_files: UploadedFilesTable;
  leave_approvals: LeaveApprovalsTable;
}
