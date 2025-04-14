import { Module } from '@nestjs/common';
import { LeaveTypesService } from './leaveTypes.service';
import { LeaveTypesController } from './leaveTypes.controller';
import { LeaveTypesRepository } from './leaveTypes.repository';
import { UserModule } from '../user/user.module';
import { DepartmentModule } from '../department/department.module';
import { LocationModule } from '../location/location.module';
import { LeaveTypeDepartmentsModule } from '../leaveTypeDepartments/leaveTypeDepartments.module';
import { LeaveTypeLocationsModule } from '../leaveTypeLocations/leaveTypeLocations.module';
import { LeaveTypeSpecialEmployeesModule } from '../leaveTypeSpecialEmployees/leaveTypeSpecialEmployees.module';

@Module({
  imports: [
    UserModule,
    LocationModule,
    DepartmentModule,
    LeaveTypeDepartmentsModule,
    LeaveTypeLocationsModule,
    LeaveTypeSpecialEmployeesModule,
  ],
  controllers: [LeaveTypesController],
  providers: [LeaveTypesService, LeaveTypesRepository],
  exports: [LeaveTypesService],
})
export class LeaveTypesModule {}
