import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsDate,
  IsArray,
} from 'class-validator';
import { LEAVE_TABLE } from '../leave.constants';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { LeaveStatus } from '../interfaces/leave.interfaces';
import { Type } from 'class-transformer';
import {
  CompareDates,
  DateComparisonOperator,
} from '../../../common/decorators/compareDates.decorator';

@ModuleName(LEAVE_TABLE)
export class CreateLeaveDto {
  @ApiProperty({
    description: 'Unique ID of the leave type',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @IsUUID('4')
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({
    description: 'Unique ID of the user',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Start date of the leave',
    example: '2024-11-01',
  })
  @IsDate()
  @Type(() => Date)
  @CompareDates({
    targetProperty: 'endDate',
    operator: DateComparisonOperator.BEFORE,
  })
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'End date of the leave',
    example: '2024-11-10',
  })
  @IsDate()
  @Type(() => Date)
  @CompareDates({
    targetProperty: 'startDate',
    operator: DateComparisonOperator.AFTER_OR_EQUAL,
  })
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({
    description: 'Comments regarding the leave',
    example: 'Family emergency',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  comment?: string;

  @ApiProperty({
    description: 'Status of the leave',
    example: LeaveStatus.PENDING,
    enum: LeaveStatus,
  })
  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus = LeaveStatus.PENDING;

  @ApiProperty({
    description: 'Array of uploaded files as attachments',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  @IsOptional()
  @IsArray()
  attachments?: Express.Multer.File[];
}
