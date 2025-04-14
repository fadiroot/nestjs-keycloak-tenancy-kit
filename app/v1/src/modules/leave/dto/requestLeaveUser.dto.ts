import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsDate,
} from 'class-validator';
import { LEAVE_TABLE } from '../leave.constants';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { Type } from 'class-transformer';
import { CompareDates, DateComparisonOperator } from '../../../common/decorators/compareDates.decorator';

@ModuleName(LEAVE_TABLE)
export class RequestLeaveUserDto {
  @ApiProperty({
    description: 'Unique ID of the leave type',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @IsUUID('4')
  @IsNotEmpty()
  leaveTypeId: string;


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
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  comment?: string;
}
