import { Module } from '@nestjs/common';
import { LeaveApprovalsService } from './leaveApprovals.service';
import { LeaveApprovalsController } from './leaveApprovals.controller';
import { LeaveApprovalsRepository } from './leaveApprovals.repository';

@Module({
  imports: [],
  controllers: [LeaveApprovalsController],
  providers: [LeaveApprovalsService, LeaveApprovalsRepository],
  exports: [LeaveApprovalsService],
})
export class LeaveApprovalsModule {}
