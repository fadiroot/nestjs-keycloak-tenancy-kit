import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  ArrayNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { DEPARTMENT } from '../department.constants';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { ApproverType } from '../enums/department.enum';

@ModuleName(DEPARTMENT)
export class CreateDepartmentDto {
  @ApiProperty({
    example: 'Engineering',
    description: 'The name of the department',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: ['1', '2'],
    description: 'Array of user IDs who are approvers for the department',
    type: [String],
  })
  @ValidateIf((obj) => obj.approverType !== undefined)
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  approvers: string[];

  @ApiProperty({
    description: 'The approver type for this leave type',
    enum: ApproverType,
    example: ApproverType.ALL,
  })
  @ValidateIf((obj) => obj.approvers && obj.approvers.length > 0)
  @IsEnum(ApproverType)
  approverType: ApproverType;

  @ApiProperty({
    example: ['3', '4'],
    description: 'Array of user IDs who are part of the department',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  users: string[];

  @ApiProperty({
    example: true,
    description:
      'If true, this department will be the default, and new teams will automatically be added to it',
  })
  @IsBoolean()
  isDefault: boolean = false;
}
