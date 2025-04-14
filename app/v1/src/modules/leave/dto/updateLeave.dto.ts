import { PartialType } from '@nestjs/swagger';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { LEAVE_TABLE } from '../leave.constants';
 import { RequestLeaveUserDto } from './requestLeaveUser.dto';
@ModuleName(LEAVE_TABLE)
export class UpdateLeaveDto extends PartialType(RequestLeaveUserDto) {}
