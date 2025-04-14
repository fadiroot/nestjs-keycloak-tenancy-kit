import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/createLeave.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { LEAVE_PATH } from './leave.constants';
import { UpdateLeaveDto } from './dto/updateLeave.dto';
import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { I18n, I18nService } from 'nestjs-i18n';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import { RequestLeaveUserDto } from './dto/requestLeaveUser.dto';
import { TenantProtected } from '../auth/decorators/tenantProtected.decorator';
import { IUserRequest } from '../user/interfaces/user.interface';
import { QueryParams } from '../../common/dto/pagination.dto';
import { UpdateStatusLeave } from './dto/updateStatusLeave.dto';
import { LeaveStatus } from './interfaces/leave.interfaces';
import { HasPermission } from '../auth/decorators/PermissionUser.decorator';
import { Permissions } from '../permission/enum/permission.enum';
import {  FilesInterceptor } from '@nestjs/platform-express';

@ApiTags(LEAVE_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@TenantProtected()
@Controller(LEAVE_PATH)
export class LeaveController {
  constructor(
    @I18n() private readonly i18n: I18nService,
    private readonly leaveService: LeaveService
  ) { }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('attachments',10))
  @HasPermission(Permissions.LEAVES_CREATE)
  @HandleErrors({
    resource: LEAVE_PATH,
    operation: 'post',
    i18nKey: 'leaves.create.error',
  })
  @ApiOperation({ summary: 'Create a new leave' })
  @ApiBody({
    type: CreateLeaveDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Leave created successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid leave data provided',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Leave with this name already exists',
  })
  async createLeave(
    @Req() req: IUserRequest,
    @Body(ValidationPipe) createLeaveDto: CreateLeaveDto,
    @UploadedFiles() attachments?: Express.Multer.File []
  ) {
    const { user } = req;
    const leave = await this.leaveService.createLeave(
      {...createLeaveDto, attachments}, user);
    return new SuccessResponse(
      await this.i18n.t('leaves.create.success'),
      leave,
      HttpStatus.CREATED
    );
  }

  @Get('/employee')
  @TenantProtected()
  @HasPermission(Permissions.LEAVES_READ)
  @HandleErrors({
    resource: LEAVE_PATH,
    operation: 'get',
    i18nKey: 'leaves.getAll.error',
  })
  @ApiOperation({ summary: 'Get all leaves' })
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
    example: { status: LeaveStatus.APPROVED },
    description: 'filter by field',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leaves retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllLeavesByEmployee(
    @Req() req: IUserRequest,
    @Query() queryParams: QueryParams
  ) {
    const { user } = req;
    const { docs, meta } = await this.leaveService.getAllLeavesByEmployee(
      user.id,
      queryParams
    );
    return new SuccessResponsePaginate(
      await this.i18n.t('leaves.getAll.success'),
      docs,
      meta
    );
  }

  @Get('/approver')
  @TenantProtected()
  @HasPermission(Permissions.LEAVES_READ)
  @HandleErrors({
    resource: LEAVE_PATH,
    operation: 'get',
    i18nKey: 'leaves.getAll.error',
  })
  @ApiOperation({ summary: 'Get all leaves' })
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
    example: { status: LeaveStatus.APPROVED },
    description: 'Filter by field',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Number of records per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leaves retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllLeavesByApprover(
    @Req() req: IUserRequest,
    @Query() queryParams: QueryParams
  ) {
    const { user } = req;
    const { docs, meta } = await this.leaveService.getAllLeavesByApprover(
      user.id,
      queryParams
    );
    return new SuccessResponsePaginate(
      await this.i18n.t('leaves.getAll.success'),
      docs,
      meta
    );
  }

  @Patch('/approver/:id')
  @TenantProtected()
  @HasPermission(Permissions.LEAVES_UPDATE)
  @HandleErrors({
    resource: LEAVE_PATH,
    operation: 'patch',
    i18nKey: 'leaves.update.error',
  })
  @ApiOperation({ summary: 'Update a leave status by approver' })
  @ApiParam({
    name: 'id',
    description: 'Leave identifier',
    example: 1,
  })
  @ApiBody({
    type: UpdateStatusLeave,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave updated successfully',
    type: SuccessResponse,
  })
  async UpdateStatusLeaveByApprover(
    @Req() req: IUserRequest,
    @Param('id') id: string,
    @Body(ValidationPipe) updateStatusLeave: UpdateStatusLeave
  ) {
    const { user } = req;
    const updateStatusLeaveByApprover = await this.leaveService.updateLeave(
      id,
      updateStatusLeave,
      user
    );
    return new SuccessResponse(
      await this.i18n.t('leaves.update.success'),
      updateStatusLeaveByApprover
    );
  }

  @Get(':id')
  @HasPermission(Permissions.LEAVES_READ)
  @HandleErrors({
    resource: LEAVE_PATH,
    operation: 'get',
    i18nKey: 'leaves.get.error',
  })
  @ApiOperation({ summary: 'Get a leave by id' })
  @ApiParam({
    name: 'id',
    description: 'Leave identifier',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave not found',
  })
  async getLeave(@Param('id') id: string) {
    const leave = await this.leaveService.getOneLeave(id);
    return new SuccessResponse(await this.i18n.t('leaves.get.success'), leave);
  }

  @Patch(':id')
  @HasPermission(Permissions.LEAVES_UPDATE)
  @HandleErrors({
    resource: LEAVE_PATH,
    operation: 'patch',
    i18nKey: 'leaves.update.error',
  })
  @ApiOperation({ summary: 'Update a leave' })
  @ApiParam({
    name: 'id',
    description: 'Leave identifier',
    example: 1,
  })
  @ApiBody({
    type: UpdateLeaveDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave updated successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Leave name already exists',
  })
  async updateLeave(
    @Req() req: IUserRequest,
    @Param('id') id: string,
    @Body(ValidationPipe) updateLeaveDto: UpdateLeaveDto
  ) {
    const { user } = req;
    const updatedLeave = await this.leaveService.updateLeave(
      id,
      updateLeaveDto,
      user
    );
    return new SuccessResponse(
      await this.i18n.t('leaves.update.success'),
      updatedLeave
    );
  }

  @Delete(':id')
  @HasPermission(Permissions.LEAVES_DELETE)
  @HandleErrors({
    resource: LEAVE_PATH,
    operation: 'delete',
    i18nKey: 'leaves.delete.error',
  })
  @ApiOperation({ summary: 'Delete a leave' })
  @ApiParam({
    name: 'id',
    description: 'Leave identifier',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Leave not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Leave cannot be deleted due to existing references',
  })
  async deleteLeave(@Param('id') id: string) {
    await this.leaveService.deleteLeave(id);
    return new SuccessMsgResponse(await this.i18n.t('leaves.delete.success'));
  }

  @Post('/user')
  @TenantProtected()
  @HasPermission(Permissions.LEAVES_CREATE)
  @HandleErrors({
    resource: LEAVE_PATH,
    operation: 'post',
    i18nKey: 'leaves.create.error',
  })
  async requestLeaveUser(
    @Body() requestLeaveUserDto: RequestLeaveUserDto,
    @Req() req: IUserRequest
  ) {
    const { user } = req;
    const leave = await this.leaveService.requestLeaveUser(
      requestLeaveUserDto,
      user
    );
    return new SuccessResponse(
      await this.i18n.t('leaves.create.success'),
      leave,
      HttpStatus.CREATED
    );
  }
}
