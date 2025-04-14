import { Module } from '@nestjs/common';
import { LeaveTypeSpecialEmployeesService } from './leavetypeSpecialEmployees.service';
import { LeaveTypeSpecialEmployeesController } from './leaveTypeSpecialEmployees.controller';
import { LeaveTypeSpecialEmployeesRepository } from './leaveTypeSpecialEmployees.repository';

@Module({
  imports: [],
  controllers: [LeaveTypeSpecialEmployeesController],
  providers: [
    LeaveTypeSpecialEmployeesService,
    LeaveTypeSpecialEmployeesRepository,
  ],
  exports: [LeaveTypeSpecialEmployeesService],
})
export class LeaveTypeSpecialEmployeesModule {}
