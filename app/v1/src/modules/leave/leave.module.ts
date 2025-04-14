import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { LeaveRepository } from './leave.repository';
import { UserModule } from '../user/user.module';
import { LeaveTypesModule } from '../leaveTypes/leaveTypes.module';
import { DepartmentLeaveApproversModule } from '../departmentLeaveApprovers/departmentLeaveApprovers.module';
import { TenantModule } from '../../tenants/tenants.module';
import { LeaveTypeDepartmentsModule } from '../leaveTypeDepartments/leaveTypeDepartments.module';
import { LeaveTypeSpecialEmployeesModule } from '../leaveTypeSpecialEmployees/leaveTypeSpecialEmployees.module';
import { LeaveApprovalsModule } from '../leaveApprovals/leaveApprovals.module';
import { DepartmentModule } from '../department/department.module';
import { DropboxModule } from '../dropbox/dropbox.module';
import { UploadedFileModule } from '../uploadedFiles/uploadedFile.module';

@Module({
  imports: [
    TenantModule,
    UserModule,
    LeaveTypesModule,
    LeaveTypeDepartmentsModule,
    LeaveTypeSpecialEmployeesModule,
    DepartmentLeaveApproversModule,
    LeaveApprovalsModule,
    DepartmentModule,
    DropboxModule,
    UploadedFileModule
  ],
  controllers: [LeaveController],
  providers: [LeaveService, LeaveRepository],
})
export class LeaveModule {}
