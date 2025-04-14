import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ModuleName } from '../../../common/decorators/module-name.decorator';

@ModuleName('leaveTypeLocations')
export class CreateLeaveTypeLocationDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  leaveTypeId: string;
}
