import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentLeaveApproverDto } from './createDepartmentLeaveApprover.dto';

export class UpdateDepartmentLeaveApproverDto extends PartialType(CreateDepartmentLeaveApproverDto) {}
