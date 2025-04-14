import { PartialType } from '@nestjs/mapped-types';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { ROLE_PATH } from '../constants';
import { CreateRoleDto } from './create-role.dto';

@ModuleName(ROLE_PATH)
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
