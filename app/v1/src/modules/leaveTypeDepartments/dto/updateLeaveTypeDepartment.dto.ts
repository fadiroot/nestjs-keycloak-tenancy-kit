import { PartialType } from '@nestjs/swagger';
import { CreateLeaveTypeDepartmentDto } from './createLeaveTypeDepartment.dto';
import { ModuleName } from '../../../common/decorators/module-name.decorator';

@ModuleName('leaveTypeLocations')
export class UpdateLeaveTypeDepartmentDto extends PartialType(
  CreateLeaveTypeDepartmentDto
) {}
