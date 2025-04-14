import { PartialType } from '@nestjs/swagger';
import { CreateLeaveTypeDto } from './createLeaveTypes.dto';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { LEAVE_TYPE_PATH } from '../leaveTypes.constants';
@ModuleName(LEAVE_TYPE_PATH)
export class UpdateLeaveTypeDto extends PartialType(CreateLeaveTypeDto) {}
