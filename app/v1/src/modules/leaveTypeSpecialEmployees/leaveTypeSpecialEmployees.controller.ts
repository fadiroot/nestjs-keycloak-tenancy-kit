import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { LeaveTypeSpecialEmployeesService } from './leavetypeSpecialEmployees.service';
import { CreateLeaveTypeSpecialEmployeeDto } from './dto/createLeaveTypeSpecialEmployee.dto';
import { UpdateLeaveTypeSpecialEmployeeDto } from './dto/updateLeaveTypeSpecialEmployee.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import { QueryParams } from '../../common/dto/pagination.dto';
import {
  SuccessResponsePaginate,
  SuccessResponse,
} from '../../common/utils/response/response.util';

@ApiTags('leave-type-special-employees')
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller('leave-type-special-employees')
export class LeaveTypeSpecialEmployeesController {
  constructor(
    private readonly leaveTypeSpecialEmployeesService: LeaveTypeSpecialEmployeesService,
    private readonly i18n: I18nService
  ) {}

  @Get(':leaveTypeId')
  @HandleErrors({
    resource: 'leaveTypeSpecialEmployees',
    operation: 'getAll',
    i18nKey: 'leaveTypeSpecialEmployees.getAll.error',
  })
  @ApiOperation({
    summary: 'Get all leave type specialEmployees by leave type ID',
  })
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
    description: 'List of leave type specialEmployees retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllLeaveTypeSpecialEmployees(
    @Param('leaveTypeId', ParseUUIDPipe) leaveTypeId: string,
    @Query() queryParams: QueryParams
  ) {
    const { docs, meta } =
      await this.leaveTypeSpecialEmployeesService.getAllLeaveTypeSpecialEmployeesByLeaveTypeId(
        leaveTypeId,
        queryParams
      );
    return new SuccessResponsePaginate(
      await this.i18n.t('leaveTypeSpecialEmployees.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':leaveTypeId/special-employees/:userId')
  @HandleErrors({
    resource: 'leaveTypeSpecialEmployees',
    operation: 'getOne',
    i18nKey: 'leaveTypeSpecialEmployees.get.error',
  })
  @ApiOperation({
    summary:
      'Get a specific leave type specialEmployee by leave type ID and user ID',
  })
  @ApiParam({
    name: 'leaveTypeId',
    type: String,
    description: 'Leave Type ID',
    required: true,
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave type specialEmployee retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave type specialEmployee not found',
  })
  async getLeaveTypeSpecialEmployee(
    @Param('leaveTypeId', ParseUUIDPipe) leaveTypeId: string,
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    const leaveTypeSpecialEmployee =
      await this.leaveTypeSpecialEmployeesService.getOneLeaveTypeSpecialEmployee(
        leaveTypeId,
        userId
      );
    return new SuccessResponse(
      await this.i18n.t('leaveTypeSpecialEmployees.get.success'),
      leaveTypeSpecialEmployee
    );
  }

  @Delete(':leaveTypeId/special-employees/:userId')
  @HandleErrors({
    resource: 'leaveTypeSpecialEmployees',
    operation: 'delete',
    i18nKey: 'leaveTypeSpecialEmployees.delete.error',
  })
  @ApiOperation({ summary: 'Delete a leave type specialEmployee' })
  @ApiParam({
    name: 'leaveTypeId',
    type: String,
    description: 'Leave Type ID',
    required: true,
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave type specialEmployee deleted successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave type specialEmployee not found',
  })
  async deleteLeaveTypeSpecialEmployee(
    @Param('leaveTypeId', ParseUUIDPipe) leaveTypeId: string,
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    const deletedSpecialEmployee =
      await this.leaveTypeSpecialEmployeesService.deleteLeaveTypeSpecialEmployee(
        leaveTypeId,
        userId
      );
    return new SuccessResponse(
      await this.i18n.t('leaveTypeSpecialEmployees.delete.success'),
      deletedSpecialEmployee
    );
  }
}
