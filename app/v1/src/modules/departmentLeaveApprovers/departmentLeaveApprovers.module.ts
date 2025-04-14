import { Module } from '@nestjs/common';
import { DepartmentLeaveApproversService } from './departmentLeaveApprovers.service';
import { DepartmentLeaveApproversController } from './departmentLeaveApprovers.controller';
import { DepartmentLeaveApproversRepository } from './departmentLeaveApprovers.repository';

@Module({
  controllers: [DepartmentLeaveApproversController],
  providers: [
    DepartmentLeaveApproversService,
    DepartmentLeaveApproversRepository,
  ],
  exports: [DepartmentLeaveApproversService],
})
export class DepartmentLeaveApproversModule {}
