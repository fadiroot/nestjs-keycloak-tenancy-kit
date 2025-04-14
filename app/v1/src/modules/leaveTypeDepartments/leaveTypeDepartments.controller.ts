import {
  Controller,
  Get,
  Param,
  Delete,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { LeaveTypeDepartmentsService } from './leaveTypeDepartments.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import {
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { QueryParams } from '../../common/dto/pagination.dto';

@ApiTags('leave-type-departments')
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller('leave-type-departments')
export class LeaveTypeDepartmentsController {
  constructor(
    private readonly leaveTypeDepartmentsService: LeaveTypeDepartmentsService,
    private readonly i18n: I18nService
  ) {}

  @Get(':leaveTypeId')
  @HandleErrors({
    resource: 'leaveTypeDepartments',
    operation: 'getAll',
    i18nKey: 'leaveTypeDepartments.getAll.error',
  })
  @ApiOperation({ summary: 'Get all leave type departments by leave type ID' })
  @ApiParam({
    name: 'leaveTypeId',
    type: String,
    description: 'Leave Type ID',
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of leave type departments retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllLeaveTypeDepartmentsByLeaveTypeId(
    @Param('leaveTypeId', ParseUUIDPipe) leaveTypeId: string,
    @Query() queryParams: QueryParams
  ) {
    const { docs, meta } =
      await this.leaveTypeDepartmentsService.getAllLeaveTypeDepartmentByLeaveTypeId(
        leaveTypeId,
        queryParams
      );
    return new SuccessResponsePaginate(
      await this.i18n.t('leaveTypeDepartments.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':leaveTypeId/departments/:departmentId')
  @HandleErrors({
    resource: 'leaveTypeDepartments',
    operation: 'getOne',
    i18nKey: 'leaveTypeDepartments.get.error',
  })
  @ApiOperation({
    summary:
      'Get a specific leave type department by leave type ID and department ID',
  })
  @ApiParam({
    name: 'leaveTypeId',
    type: String,
    description: 'Leave Type ID',
    required: true,
  })
  @ApiParam({
    name: 'departmentId',
    type: String,
    description: 'Department ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave type department retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave type department not found',
  })
  async getLeaveTypeDepartment(
    @Param('leaveTypeId', ParseUUIDPipe) leaveTypeId: string,
    @Param('departmentId', ParseUUIDPipe) departmentId: string
  ) {
    const leaveTypeDepartment =
      await this.leaveTypeDepartmentsService.getOneLeaveTypeDepartment(
        leaveTypeId,
        departmentId
      );
    return new SuccessResponse(
      await this.i18n.t('leaveTypeDepartments.get.success'),
      leaveTypeDepartment
    );
  }

  @Delete(':leaveTypeId/departments/:departmentId')
  @HandleErrors({
    resource: 'leaveTypeDepartments',
    operation: 'delete',
    i18nKey: 'leaveTypeDepartments.delete.error',
  })
  @ApiOperation({ summary: 'Delete a leave type department' })
  @ApiParam({
    name: 'leaveTypeId',
    type: String,
    description: 'Leave Type ID',
    required: true,
  })
  @ApiParam({
    name: 'departmentId',
    type: String,
    description: 'Department ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave type department deleted successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave type department not found',
  })
  async deleteLeaveTypeDepartment(
    @Param('leaveTypeId', ParseUUIDPipe) leaveTypeId: string,
    @Param('departmentId', ParseUUIDPipe) departmentId: string
  ) {
    const deletedLeaveTypeDepartment =
      await this.leaveTypeDepartmentsService.deleteLeaveTypeDepartment(
        leaveTypeId,
        departmentId
      );
    return new SuccessResponse(
      await this.i18n.t('leaveTypeDepartments.delete.success'),
      deletedLeaveTypeDepartment
    );
  }
}
