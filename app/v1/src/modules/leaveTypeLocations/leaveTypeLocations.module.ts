import { Module } from '@nestjs/common';
import { LeaveTypeLocationsService } from './leaveTypeLocations.service';
import { LeaveTypeLocationsController } from './leaveTypeLocations.controller';
import { LeaveTypeLocationsRepository } from './leaveTypeLocations.repository';

@Module({
  imports: [],
  controllers: [LeaveTypeLocationsController],
  providers: [LeaveTypeLocationsService, LeaveTypeLocationsRepository],
  exports: [LeaveTypeLocationsService],
})
export class LeaveTypeLocationsModule {}
