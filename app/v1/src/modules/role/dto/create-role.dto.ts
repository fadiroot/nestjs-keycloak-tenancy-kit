import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsNumber } from 'class-validator';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { ROLE_PATH } from '../constants';

@ModuleName(ROLE_PATH)
export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'The name of the role',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'description',
    description: 'The description of the role',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;


  @ApiProperty({
    example: 20,
    description: 'The number of annual leave days for the role',
  })
  @IsNumber()
  @IsNotEmpty()
  annualLeaveDays: number;

}
