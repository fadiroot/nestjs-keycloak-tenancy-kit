import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { LeaveStatus } from '../interfaces/leave.interfaces';
import { LEAVE_PATH } from '../leave.constants';

@ModuleName(LEAVE_PATH)
export class UpdateStatusLeave {
  @ApiProperty({
    description: 'Status of the leave',
    example: LeaveStatus.PENDING,
    enum: LeaveStatus,
  })
  @IsEnum([LeaveStatus.APPROVED, LeaveStatus.REJECTED])
  status: LeaveStatus;

  @ApiProperty({
    description:
      'Detailed explanation or justification for the leave status update',
    example: 'Unable to attend due to urgent health issues',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
