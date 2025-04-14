import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ModuleName } from '../../../common/decorators/module-name.decorator';

@ModuleName('leaveTypeSpecialEmployees')
export class CreateLeaveTypeSpecialEmployeeDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  leaveTypeId: string;
}
