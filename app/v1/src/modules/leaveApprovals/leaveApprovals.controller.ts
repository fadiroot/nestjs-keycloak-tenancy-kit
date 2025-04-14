import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { LeaveApprovalsService } from './leaveApprovals.service';
import { LEAVE_APPROVALS_PATH } from './leaveApprovals.constants';
import {
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiResponse,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TenantProtected } from '../auth/decorators/tenantProtected.decorator';
import { I18n, I18nService } from 'nestjs-i18n';
import { LeaveApprovalsStatus } from './enums/leaveApprovals.enum';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import {
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { QueryParams } from '../../common/dto/pagination.dto';

@Controller(LEAVE_APPROVALS_PATH)
@ApiTags(LEAVE_APPROVALS_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@TenantProtected()
export class LeaveApprovalsController {
  constructor(
    @I18n() private readonly i18n: I18nService,
    private readonly leaveApprovalsService: LeaveApprovalsService
  ) {}

  @Get('/')
  @TenantProtected()
  @HandleErrors({
    resource: LEAVE_APPROVALS_PATH,
    operation: 'get',
    i18nKey: 'leaveApprovals.getAll.error',
  })
  @ApiOperation({ summary: 'Get all leave approvals' })
  @ApiParam({
    name: 'leaveId',
    type: String,
    description: 'Leave ID',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    type: String,
    required: false,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: String,
    required: false,
    example: 10,
    description: 'Number of records per page',
  })
  @ApiQuery({
    name: 'filter',
    type: String,
    required: false,
    example: { status: LeaveApprovalsStatus.APPROVED },
    description: 'filter by field',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave approvals retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllLeaveApprovals(
    @Param('leaveId') leaveId: string,
    @Query() queryParams: QueryParams
  ) {
    const { docs, meta } =
      await this.leaveApprovalsService.getAllLeaveApprovals(
        leaveId,
        queryParams
      );
    return new SuccessResponsePaginate(
      await this.i18n.t('leaveApprovals.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':leaveId/approver/:approverId')
  @HandleErrors({
    resource: LEAVE_APPROVALS_PATH,
    operation: 'get',
    i18nKey: 'leaveApprovals.get.error',
  })
  @ApiOperation({ summary: 'Get a leave approvals by leaveId and approverId' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave not found',
  })
  async getLeaveApproval(
    @Param('leaveId') leaveId: string,
    @Param('approverId') approverId: string
  ) {
    const leaveApproval = await this.leaveApprovalsService.getOneLeaveApproval(
      leaveId,
      approverId
    );
    return new SuccessResponse(
      await this.i18n.t('leaveApprovals.get.success'),
      leaveApproval
    );
  }
}
