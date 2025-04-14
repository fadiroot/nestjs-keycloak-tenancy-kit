import { PartialType } from '@nestjs/swagger';
import { CreateLeaveTypeSpecialEmployeeDto } from './createLeaveTypeSpecialEmployee.dto';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
@ModuleName('leaveTypeSpecialEmployees')
export class UpdateLeaveTypeSpecialEmployeeDto extends PartialType(
  CreateLeaveTypeSpecialEmployeeDto
) {}
