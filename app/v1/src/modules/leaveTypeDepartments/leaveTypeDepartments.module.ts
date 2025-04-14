import { Module } from '@nestjs/common';
import { LeaveTypeDepartmentsService } from './leaveTypeDepartments.service';
import { LeaveTypeDepartmentsController } from './leaveTypeDepartments.controller';
import { LeaveTypeDepartmentRepository } from './leaveTypeDepartments.repository';

@Module({
  imports: [],
  controllers: [LeaveTypeDepartmentsController],
  providers: [LeaveTypeDepartmentsService, LeaveTypeDepartmentRepository],
  exports: [LeaveTypeDepartmentsService],
})
export class LeaveTypeDepartmentsModule {}
