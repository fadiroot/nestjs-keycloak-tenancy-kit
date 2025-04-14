import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { USER_PATH } from '../user.constants';
@ModuleName(USER_PATH)
export class CreateUserDto {
  id: string;
  @ApiProperty({
    description: 'Username of the user',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    description: 'Keycloak user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiProperty({
    description: 'Mobile phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  mobile_phone_number: string;

  @ApiProperty({
    description: 'Work phone number',
    example: '+1987654321',
  })
  @IsString()
  @IsOptional()
  work_phone_number: string;

  @ApiProperty({
    description: 'Birthday of the user',
    example: '1990-01-01',
  })
  @IsDate()
  @IsOptional()
  brithday: Date;
  @IsDate()
  @IsOptional()
  hire_date: Date;

  @ApiProperty({
    description: 'Employment status',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
  })
  @IsString()
  @IsOptional()
  employment_status: string;

  @ApiProperty({
    description: 'User role ID',
    example: 'role_123',
  })
  @IsString()
  user_role_id: string;

  @ApiProperty({
    description: 'Department ID',
    example: 'dept_123',
  })
  @IsString()
  @IsNotEmpty()
  department_id: string;
  @IsString()
  @IsNotEmpty()
  country: string;
  @IsString()
  marital_status: string;

}
