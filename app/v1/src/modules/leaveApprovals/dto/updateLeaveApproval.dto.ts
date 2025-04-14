import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveApprovalDto } from './createLeaveApproval.dto';
import { ModuleName } from '../../../common/decorators/module-name.decorator';
import { LEAVE_APPROVALS } from '../leaveApprovals.constants';
@ModuleName(LEAVE_APPROVALS)
export class UpdateLeaveApprovalDto extends PartialType(
  CreateLeaveApprovalDto
) {}
