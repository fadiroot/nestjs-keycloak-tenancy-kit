import { PartialType } from '@nestjs/swagger';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { ROLE_PERMISSION_PATH } from '../constants';
import { CreateRolePermissionDto } from './createrolePermission.dto';

@ModuleName(ROLE_PERMISSION_PATH)
export class UpdateRolePermissionDto extends PartialType(
  CreateRolePermissionDto
) {}
