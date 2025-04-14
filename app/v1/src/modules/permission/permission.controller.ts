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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
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
import { PERMISSION_PATH } from './constants';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { I18n, I18nService, I18nValidationPipe } from 'nestjs-i18n';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import { QueryParams } from '../../common/dto/pagination.dto';
import { TenantProtected } from '../auth/decorators/tenantProtected.decorator';
import { HasPermission } from '../auth/decorators/PermissionUser.decorator';
import { Permissions } from './enum/permission.enum';

@ApiTags(PERMISSION_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller(PERMISSION_PATH)
export class PermissionController {
  constructor(
    @I18n() private readonly i18n: I18nService,
    private readonly permissionService: PermissionService
  ) { }

  @Post()
  @HasPermission(Permissions.ROLE_PERMISSION_CREATE)
  @HandleErrors({
    resource: PERMISSION_PATH,
    operation: 'post',
    i18nKey: 'permissions.create.error',
  })
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({
    type: CreatePermissionDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'permissions.create.success',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid permission data provided',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Permission with this name already exists',
  })
  async createPermission(
    @Body(ValidationPipe) createPermissionDto: CreatePermissionDto
  ) {
    const permission =
      await this.permissionService.createPermission(createPermissionDto);
    return new SuccessResponse(
      await this.i18n.t('permissions.create.success'),
      permission,
      HttpStatus.CREATED
    );
  }

  @Get()
  @HasPermission(Permissions.ROLE_PERMISSION_LIST)
  @TenantProtected()
  @HandleErrors({
    resource: PERMISSION_PATH,
    operation: 'get',
    i18nKey: 'permissions.getAll.error',
  })
  @ApiOperation({ summary: 'Get all permissions' })
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
    example: { resource: 'roles' },
    description: 'Filter by field',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'permissions.getAll.success',
    type: SuccessResponsePaginate,
  })
  async getAllPermissions(@Query() queryParams: QueryParams) {
    const { docs, meta } =
      await this.permissionService.getAllPermissions(queryParams);
    return new SuccessResponsePaginate(
      await this.i18n.t('permissions.getAll.success'),
      docs,
      meta
    );
  }

  @Get('/resources')
  @HasPermission(Permissions.ROLE_PERMISSION_READ)
  @HandleErrors({
    resource: PERMISSION_PATH,
    operation: 'get',
    i18nKey: 'permissions.getAll.error',
  })
  @ApiOperation({ summary: 'Get all resources permissions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'permissions.getAll.success',
    type: SuccessResponsePaginate,
  })
  async getAllResourcePermissions(@Query() queryParams: QueryParams) {
    const { docs, meta } =
      await this.permissionService.getAllResourcePermissions(queryParams);
    return new SuccessResponsePaginate(
      await this.i18n.t('permissions.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':id')
  @HasPermission(Permissions.ROLE_PERMISSION_READ)
  @HandleErrors({
    resource: PERMISSION_PATH,
    operation: 'get',
    i18nKey: 'permissions.get.error',
  })
  @ApiOperation({ summary: 'Get a permission by id' })
  @ApiParam({
    name: 'id',
    description: 'Permission identifier',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'permissions.get.success',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
  })
  async getPermission(@Param('id') id: string) {
    const permission = await this.permissionService.getOnePermission(id);
    return new SuccessResponse(
      await this.i18n.t('permissions.get.success', {
        args: { name: permission.name },
      }),
      permission
    );
  }

  @Patch(':id')
  @HasPermission(Permissions.ROLE_PERMISSION_UPDATE)
  @HandleErrors({
    resource: PERMISSION_PATH,
    operation: 'patch',
    i18nKey: 'permissions.update.error',
  })
  @UsePipes(I18nValidationPipe)
  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({
    name: 'id',
    description: 'Permission identifier',
    example: 1,
  })
  @ApiBody({
    type: UpdatePermissionDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'permissions.update.success',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'permissions.update.success',
  })
  async updatePermission(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePermissionDto: UpdatePermissionDto
  ) {
    const updatedPermission = await this.permissionService.updatePermission(
      id,
      updatePermissionDto
    );
    return new SuccessResponse(
      await this.i18n.t('permissions.update.success', {
        args: { name: updatedPermission.name },
      }),
      updatedPermission
    );
  }

  @Delete(':id')
  @HasPermission(Permissions.ROLE_PERMISSION_DELETE)
  @HandleErrors({
    resource: PERMISSION_PATH,
    operation: 'delete',
    i18nKey: 'permissions.delete.error',
  })
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({
    name: 'id',
    description: 'Permission identifier',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'permissions.delete.success',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Permission cannot be deleted due to existing references',
  })
  async deletePermission(@Param('id') id: string) {
    const permission = await this.permissionService.deletePermission(id);
    return new SuccessMsgResponse(
      await this.i18n.t('permissions.delete.success', {
        args: { name: permission.name },
      })
    );
  }
}
