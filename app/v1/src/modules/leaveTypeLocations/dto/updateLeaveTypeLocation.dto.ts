import { PartialType } from '@nestjs/swagger';
import { CreateLeaveTypeLocationDto } from './createLeaveTypeLocation.dto';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
@ModuleName('leaveTypeLocations')
export class UpdateLeaveTypeLocationDto extends PartialType(
  CreateLeaveTypeLocationDto
) {}
