import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { DEPARTMENT_LEAVE_APPROVERS } from '../departmentLeaveApprovers.constants';
@ModuleName(DEPARTMENT_LEAVE_APPROVERS)
export class CreateDepartmentLeaveApproverDto {
  @ApiProperty({
    example: '1',
    description: 'id of the user',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: '1',
    description: 'id of the department',
  })
  @IsString()
  departmentId: string;
}
