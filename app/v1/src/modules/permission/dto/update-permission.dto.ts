import { PartialType } from '@nestjs/mapped-types';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { PERMISSION_PATH } from '../constants';
import { CreatePermissionDto } from './create-permission.dto';
@ModuleName(PERMISSION_PATH)
export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
