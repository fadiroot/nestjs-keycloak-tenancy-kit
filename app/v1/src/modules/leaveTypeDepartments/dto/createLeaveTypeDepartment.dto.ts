import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ModuleName } from '../../../common/decorators/module-name.decorator';

@ModuleName('leaveTypeLocations')
export class CreateLeaveTypeDepartmentDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  leaveTypeId: string;
}
