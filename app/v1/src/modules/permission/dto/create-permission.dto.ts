import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PERMISSION_PATH } from '../constants';
import { ModuleName } from '../../../common/decorators/module-name.decorator';

@ModuleName(PERMISSION_PATH)
export class CreatePermissionDto {
  @ApiProperty({
    example: 'CREATE_DEPARTMENT',
    description: 'The name of the permission',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'department',
    description: 'The resource associated with the permission',
  })
  @IsString()
  @IsNotEmpty()
  resource: string;
}
