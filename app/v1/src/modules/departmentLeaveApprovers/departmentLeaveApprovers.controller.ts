import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DepartmentLeaveApproversService } from './departmentLeaveApprovers.service';
import {
  DEPARTMENT_LEAVE_APPROVERS,
  DEPARTMENT_LEAVE_APPROVERS_PATH,
} from './departmentLeaveApprovers.constants';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { I18nService } from 'nestjs-i18n';
import { QueryParams } from '../../common/dto/pagination.dto';
@ApiTags(DEPARTMENT_LEAVE_APPROVERS_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller(DEPARTMENT_LEAVE_APPROVERS_PATH)
export class DepartmentLeaveApproversController {
  constructor(
    private readonly departmentLeaveApproversService: DepartmentLeaveApproversService,
    private readonly i18n: I18nService
  ) {}

  @Get(':departmentId')
  @HandleErrors({
    resource: DEPARTMENT_LEAVE_APPROVERS,
    operation: 'getAll',
    i18nKey: 'departmentLeaveApprovers.getAll.error',
  })
  @ApiOperation({ summary: 'Get all department leave approvers' })
  @ApiParam({
    name: 'departmentId',
    type: String,
    description: 'Department Leave Approver ID',
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of department leave approvers retrieved successfully',
    type: SuccessResponsePaginate,
  })
  @ApiOperation({ summary: 'Get all department leave approvers' })
  async getAllDepartmentLeaveApprovers(
    @Param('departmentId', ParseUUIDPipe) departmentId: string,
    @Query() queryParams: QueryParams
  ) {
    const { docs, meta } =
      await this.departmentLeaveApproversService.getAllDepartmentLeaveApproversByDepartmentId(
        departmentId,
        queryParams
      );
    return new SuccessResponsePaginate(
      await this.i18n.t('departmentLeaveApprovers.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':departmentId/approvers/:approverId')
  @HandleErrors({
    resource: DEPARTMENT_LEAVE_APPROVERS,
    operation: 'getOne',
    i18nKey: 'departmentLeaveApprovers.get.error',
  })
  @ApiOperation({ summary: 'Get department leave approver by ID' })
  @ApiParam({
    name: 'departmentId',
    type: String,
    description: 'Department Leave Approver ID',
  })
  @ApiParam({
    name: 'approverId',
    type: String,
    description: 'User approver ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department leave approver retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department leave approver not found',
  })
  async getDepartmentLeaveApprover(
    @Param('departmentId', ParseUUIDPipe) departmentId: string,
    @Param('approverId', ParseUUIDPipe) approverId: string
  ) {
    const departmentLeaveApprover =
      await this.departmentLeaveApproversService.getOneDepartmentLeaveApprover(
        departmentId,
        approverId
      );
    return new SuccessResponse(
      await this.i18n.t('departmentLeaveApprovers.getAll.success'),
      departmentLeaveApprover
    );
  }

  @Delete(':departmentId/approvers/:approverId')
  @HandleErrors({
    resource: DEPARTMENT_LEAVE_APPROVERS,
    operation: 'delete',
    i18nKey: 'departmentLeaveApprovers.delete.error',
  })
  @ApiOperation({ summary: 'Delete department leave approver' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department leave approver deleted successfully',
    type: SuccessResponse,
  })
  async deleteDepartmentLeaveApprover(
    @Param('departmentId', ParseUUIDPipe) departmentId: string,
    @Param('approverId', ParseUUIDPipe) approverId: string
  ) {
    const departmentLeaveApprover =
      await this.departmentLeaveApproversService.deleteDepartmentLeaveApprover(
        departmentId,
        approverId
      );
    return new SuccessResponse(
      await this.i18n.t('departmentLeaveApprovers.delete.success'),
      departmentLeaveApprover
    );
  }
}
