import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { USER_PATH } from '../user.constants';
@ModuleName(USER_PATH)
export class InviteUserDto {
  @ApiProperty({
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({
    description: 'Email address of the invited user',
    example: 'invited.user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'First name of the invited user',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the invited user',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @ApiProperty({
    description: 'username of the invited user',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  username: string;
}
