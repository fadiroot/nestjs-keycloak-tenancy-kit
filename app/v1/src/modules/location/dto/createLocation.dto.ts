// src/dto/create-location.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  MaxLength,
  IsNotEmpty,
  IsIn,
  ArrayMinSize,
  IsUUID,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';
import {
  LeaveQuotaResetOptions,
  Months,
  WeekStartOptions,
} from '../enums/location.enums';
import timeZones from '../interfaces/time-zones.interface';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { LOCATION } from '../location.constants';

@ModuleName(LOCATION)
export class CreateLocationDto {
  @ApiProperty({
    example: 'New York Office',
    description: 'Location name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: ['MONDAY', 'TUESDAY'],
    description: 'Work week days',
    enum: WeekStartOptions,
    isArray: true,
  })
  @IsArray()
  @IsEnum(WeekStartOptions, { each: true })
  @ArrayMinSize(1)
  workWeek: WeekStartOptions[];

  @ApiProperty({
    example: 'MONDAY',
    description: 'Week start day',
    enum: WeekStartOptions,
  })
  @IsEnum(WeekStartOptions)
  @IsNotEmpty()
  weekStartsOn: WeekStartOptions;

  @ApiProperty({
    example: 'ACCOUNTING_YEAR',
    description: 'Leave quota reset basis',
    enum: LeaveQuotaResetOptions,
  })
  @IsEnum(LeaveQuotaResetOptions)
  @IsNotEmpty()
  leaveQuotaResetBasedOn: LeaveQuotaResetOptions;

  @ApiProperty({
    example: 'America/New_York',
    description: 'Time zone',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(timeZones.map((tz) => tz.tzCode))
  timeZone: string;

  @ApiProperty({
    example: 'JANUARY',
    description: 'Fiscal year start month',
    enum: Months,
  })
  @IsEnum(Months)
  @IsNotEmpty()
  fiscalYearStartMonth: Months;

  @ApiProperty({
    example: true,
    description: 'Is default location',
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;

  @ApiProperty({
    example: ['f6c3bc10-4d5b-4d72-9c2e-c0d2ef52f3b7'],
    description: 'List of user IDs associated with the location',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  users: string[];
}
