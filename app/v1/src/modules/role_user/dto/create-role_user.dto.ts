import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { ROLE_USER_PATH } from '../constants';

@ModuleName(ROLE_USER_PATH)
export class CreateRoleUserDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the role',
    required: true,
  })
  @IsUUID('4')
  roleId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user',
    required: true,
  })
  @IsUUID('4')
  userId: string;
}
