import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { LeaveTypesService } from './leaveTypes.service';
import { CreateLeaveTypeDto } from './dto/createLeaveTypes.dto';
import { UpdateLeaveTypeDto } from './dto/updateLeaveTypes.dto';
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
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { I18nService } from 'nestjs-i18n';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import { LEAVE_TYPE, LEAVE_TYPE_TABLE } from './leaveTypes.constants';
import { QueryParams } from '../../common/dto/pagination.dto';
import { TenantProtected } from '../auth/decorators/tenantProtected.decorator';
import { HasPermission } from '../auth/decorators/PermissionUser.decorator';
import { Permissions } from '../permission/enum/permission.enum';

@ApiTags(LEAVE_TYPE)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller(LEAVE_TYPE)
@TenantProtected()
export class LeaveTypesController {
  constructor(
    private readonly leaveTypesService: LeaveTypesService,
    private readonly i18n: I18nService
  ) { }

  @Post()
  //@HasPermissionssion(Permissions.LEAVE_TYPES_CREATE)
  @HandleErrors({
    resource: LEAVE_TYPE_TABLE,
    operation: 'post',
    i18nKey: 'leaveTypes.create.error',
  })
  @ApiOperation({ summary: 'Create a new leave type' })
  @ApiBody({
    type: CreateLeaveTypeDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Leave type created successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid leave type data provided',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Leave type with this name already exists',
  })
  async createLeaveType(
    @Body(ValidationPipe) createLeaveTypeDto: CreateLeaveTypeDto
  ) {
    const leaveType =
      await this.leaveTypesService.createLeaveType(createLeaveTypeDto);
    return new SuccessResponse(
      await this.i18n.t('leaveTypes.create.success'),
      leaveType,
      HttpStatus.CREATED
    );
  }

  @Get()
  //@HasPermissionssion(Permissions.LEAVE_TYPES_LIST)
  @HandleErrors({
    resource: LEAVE_TYPE_TABLE,
    operation: 'get',
    i18nKey: 'leaveTypes.getAll.error',
  })
  @ApiOperation({ summary: 'Get all leave types' })
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
    description: 'Leave types retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllLeaveTypes(@Query() queryParams: QueryParams) {
    const { docs, meta } =
      await this.leaveTypesService.getAllLeaveTypes(queryParams);
    return new SuccessResponsePaginate(
      await this.i18n.t('leaveTypes.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':id')
  //@HasPermissionssion(Permissions.LEAVE_TYPES_READ)
  @HandleErrors({
    resource: LEAVE_TYPE_TABLE,
    operation: 'get',
    i18nKey: 'leaveTypes.get.error',
  })
  @ApiOperation({ summary: 'Get a leave type by id' })
  @ApiParam({
    name: 'id',
    description: 'Leave type identifier',
    example: '1f5f8b28-c387-4939-bb0b-62b564dbb2d6',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave type retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave type not found',
  })
  async getLeaveType(@Param('id', ParseUUIDPipe) id: string) {
    const leaveType = await this.leaveTypesService.getOneLeaveType(id);
    return new SuccessResponse(
      await this.i18n.t('leaveTypes.get.success', {
        args: { name: leaveType.name },
      }),
      leaveType
    );
  }

  @Patch(':id')
  //@HasPermissionssion(Permissions.LEAVE_TYPES_UPDATE)
  @HandleErrors({
    resource: LEAVE_TYPE_TABLE,
    operation: 'patch',
    i18nKey: 'leaveTypes.update.error',
  })
  @ApiOperation({ summary: 'Update a leave type' })
  @ApiParam({
    name: 'id',
    description: 'Leave type identifier',
    example: '1f5f8b28-c387-4939-bb0b-62b564dbb2d6',
  })
  @ApiBody({
    type: UpdateLeaveTypeDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave type updated successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave type not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Leave type name already exists',
  })
  async updateLeaveType(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateLeaveTypeDto: UpdateLeaveTypeDto
  ) {
    const updatedLeaveType = await this.leaveTypesService.updateLeaveType(
      id,
      updateLeaveTypeDto
    );
    return new SuccessResponse(
      await this.i18n.t('leaveTypes.update.success', {
        args: { name: updatedLeaveType.name },
      }),
      updatedLeaveType
    );
  }

  @Delete(':id')
  //@HasPermissionssion(Permissions.LEAVE_TYPES_DELETE)
  @HandleErrors({
    resource: LEAVE_TYPE_TABLE,
    operation: 'delete',
    i18nKey: 'leaveTypes.delete.error',
  })
  @ApiOperation({ summary: 'Delete a leave type' })
  @ApiParam({
    name: 'id',
    description: 'Leave type identifier',
    example: '1f5f8b28-c387-4939-bb0b-62b564dbb2d6',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave type deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave type not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Leave type cannot be deleted due to existing references',
  })
  async deleteLeaveType(@Param('id', ParseUUIDPipe) id: string) {
    const leaveType = await this.leaveTypesService.deleteLeaveType(id);
    return new SuccessMsgResponse(
      await this.i18n.t('leaveTypes.delete.success', {
        args: { name: leaveType.name },
      })
    );
  }
}
