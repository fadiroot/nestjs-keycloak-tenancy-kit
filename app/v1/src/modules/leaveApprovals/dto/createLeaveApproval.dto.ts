import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { LEAVE_APPROVALS } from '../leaveApprovals.constants';
import { LeaveApprovalsStatus } from '../enums/leaveApprovals.enum';

@ModuleName(LEAVE_APPROVALS)
export class CreateLeaveApprovalDto {
  @ApiProperty({
    description: 'Unique ID of the leave',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @IsUUID('4')
  @IsNotEmpty()
  leaveId: string;

  @ApiProperty({
    description: 'Unique ID of the approver',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @IsUUID('4')
  @IsNotEmpty()
  approverId: string;

  @ApiProperty({
    description: 'Reason for approval or rejection',
    example: 'Employee performance issue',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;

  @ApiProperty({
    description: 'Status of the leave approval',
    example: LeaveApprovalsStatus.PENDING,
    enum: LeaveApprovalsStatus,
  })
  @IsEnum(LeaveApprovalsStatus)
  @IsOptional()
  status?: LeaveApprovalsStatus = LeaveApprovalsStatus.PENDING;
}
