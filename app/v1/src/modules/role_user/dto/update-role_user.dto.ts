import { PartialType } from '@nestjs/swagger';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { ROLE_USER_PATH } from '../constants';
import { CreateRoleUserDto } from './create-role_user.dto';

@ModuleName(ROLE_USER_PATH)
export class UpdateRoleUserDto extends PartialType(CreateRoleUserDto) {}
