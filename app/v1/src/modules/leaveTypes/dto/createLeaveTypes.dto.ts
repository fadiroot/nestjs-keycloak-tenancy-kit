import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsBoolean,
  ArrayNotEmpty,
  IsArray,
  IsUUID,
  Max,
  Min,
  ValidateIf,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import {
  AssignToType,
  YearlyQuotaType,
  YearlyQuotaUnit,
} from '../enums/leaveTypes.enum';
import { LEAVE_TYPE_PATH } from '../leaveTypes.constants';
import { IsUUIDOrAll } from '../../../common/validators/is-uuid-or-all.validator';

@ModuleName(LEAVE_TYPE_PATH)
export class CreateLeaveTypeDto {
  @ApiProperty({
    description: 'The icon of leave type',
    example: 1,
  })
  @IsNumber()
  @Max(12)
  @Min(1)
  @IsNotEmpty()
  icon: number;

  @ApiProperty({
    description: 'The name of the leave type',
    example: 'Annual Leave',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The type of yearly quota applied to this leave type',
    enum: YearlyQuotaType,
    example: YearlyQuotaType.UNLIMITED,
  })
  @IsEnum(YearlyQuotaType)
  yearlyQuotaType: YearlyQuotaType;

  @ApiProperty({
    description: 'The value of the yearly quota for this leave type',
    example: 30,
  })
  @IsNumber()
  yearlyQuotaValue: number;

  @ApiProperty({
    description: 'The unit for the yearly quota',
    enum: YearlyQuotaUnit,
    example: YearlyQuotaUnit.DAYS,
  })
  @IsEnum(YearlyQuotaUnit)
  yearlyQuotaUnit: YearlyQuotaUnit;

  @ApiProperty({
    description: 'Whether negative balances are allowed for this leave type',
    example: false,
  })
  @IsBoolean()
  allowNegativeBalance: boolean;

  @ApiProperty({
    description: 'Whether providing a reason is mandatory for this leave type',
    example: true,
  })
  @IsBoolean()
  reasonRequired: boolean;

  @ApiProperty({
    description: 'Whether weekends are subtracted from the leave calculation',
    example: false,
  })
  @IsBoolean()
  subtractWeekends: boolean;

  @ApiProperty({
    description: 'Assign to type DEPARTMENTS or EMPLOYEES',
    enum: AssignToType,
    example: AssignToType.DEPARTMENTS,
  })
  @IsEnum(AssignToType)
  assignToType: AssignToType;

  @ApiProperty({
    example: ['1', '2'],
    description: 'Array of department IDs or "all" for the leave types',
    type: [String],
  })
  @ValidateIf((o) => o.assignToType === AssignToType.DEPARTMENTS)
  @IsArray()
  @ArrayNotEmpty()
  @Validate(IsUUIDOrAll)
  departments: string[];

  @ApiProperty({
    example: ['1', '2'],
    description: 'Array of employee IDs for the leave types',
    type: [String],
  })
  @ValidateIf((o) => o.assignToType === AssignToType.EMPLOYEES)
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  employees: string[];

  @ApiProperty({
    example: ['1', '2'],
    description: 'Array of location IDs for the leave types',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Validate(IsUUIDOrAll)
  locations: string[];
}
