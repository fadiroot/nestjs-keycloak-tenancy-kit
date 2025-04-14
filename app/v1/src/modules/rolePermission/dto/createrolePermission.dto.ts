import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { ROLE_PERMISSION_PATH } from '../constants';

@ModuleName(ROLE_PERMISSION_PATH)
export class CreateRolePermissionDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the role',
    required: true,
  })
  @IsString()
  @IsUUID()
  roleId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the permission',
    required: true,
  })
  @IsString()
  @IsUUID()
  permissionId: string;
}
