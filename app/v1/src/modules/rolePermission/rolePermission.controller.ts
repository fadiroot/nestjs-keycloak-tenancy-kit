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
import { RolePermissionService } from './rolePermission.service';
import { CreateRolePermissionDto } from './dto/createrolePermission.dto';
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
import { ROLE_PERMISSION_PATH } from './constants';
import { UpdateRolePermissionDto } from './dto/updateRolePermission.dto';
import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { I18n, I18nService, I18nValidationPipe } from 'nestjs-i18n';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import { QueryParams } from '../../common/dto/pagination.dto';

@ApiTags(ROLE_PERMISSION_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller(ROLE_PERMISSION_PATH)
export class RolePermissionController {
  constructor(
    @I18n() private readonly i18n: I18nService,
    private readonly role_permissionService: RolePermissionService
  ) {}

  @Post()
  @HandleErrors({
    resource: ROLE_PERMISSION_PATH,
    operation: 'post',
    i18nKey: 'rolePermission.create.error',
  })
  @ApiOperation({ summary: 'Create a new role_permission' })
  @ApiBody({
    type: [CreateRolePermissionDto],
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'RolePermission created successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid role_permission data provided',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'RolePermission with this name already exists',
  })
  async createRolePermission(
    @Body(ValidationPipe) createRolePermissionDto: CreateRolePermissionDto[]
  ) {
    const role_permission =
      await this.role_permissionService.createRolePermission(
        createRolePermissionDto
      );
    return new SuccessResponse(
      await this.i18n.t('rolePermission.create.success'),
      role_permission,
      HttpStatus.CREATED
    );
  }

  @Get()
  @HandleErrors({
    resource: ROLE_PERMISSION_PATH,
    operation: 'get',
    i18nKey: 'rolePermission.getAll.error',
  })
  @ApiOperation({ summary: 'Get all rolePermission' })
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
    description: 'Filter by field',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'RolePermissions retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllRolePermissions(@Query() queryParams: QueryParams) {
    const { docs, meta } =
      await this.role_permissionService.getAllRolePermissions(queryParams);
    return new SuccessResponsePaginate(
      await this.i18n.t('rolePermission.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':roleId/permission/permissionId')
  @HandleErrors({
    resource: ROLE_PERMISSION_PATH,
    operation: 'get',
    i18nKey: 'rolePermission.get.error',
  })
  @ApiOperation({ summary: 'Get a role_permission by id' })
  @ApiParam({
    name: 'roleId',
    description: 'Role identifier',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'RolePermission identifier',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'RolePermission retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RolePermission not found',
  })
  async getRolePermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string
  ) {
    const role_permission =
      await this.role_permissionService.getOneRolePermission(
        roleId,
        permissionId
      );

    return new SuccessResponse(
      await this.i18n.t('rolePermission.get.success'),
      role_permission
    );
  }

  @Patch(':roleId')
  @HandleErrors({
    resource: ROLE_PERMISSION_PATH,
    operation: 'patch',
    i18nKey: 'rolePermission.update.error',
  })
  @ApiOperation({ summary: 'Update a role_permission' })
  @ApiParam({
    name: 'roleId',
    description: 'Role identifier',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @ApiBody({
    type: [UpdateRolePermissionDto],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'RolePermission updated successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RolePermission not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'RolePermission name already exists',
  })
  async updateRolePermission(
    @Param('roleId') roleId: string,
    @Body(ValidationPipe) updateRolePermissionDto: UpdateRolePermissionDto[]
  ) {
    const updatedRolePermission =
      await this.role_permissionService.updateRolePermission(
        roleId,
        updateRolePermissionDto
      );
    return new SuccessResponse(
      await this.i18n.t('rolePermission.update.success'),
      updatedRolePermission
    );
  }

  @Delete(':roleId/permission/:permissionId')
  @HandleErrors({
    resource: ROLE_PERMISSION_PATH,
    operation: 'delete',
    i18nKey: 'rolePermission.delete.error',
  })
  @ApiOperation({ summary: 'Delete a role_permission' })
  @ApiParam({
    name: 'roleId',
    description: 'Role identifier',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission identifier',
    example: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'RolePermission deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RolePermission not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'RolePermission cannot be deleted due to existing references',
  })
  async deleteRolePermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string
  ) {
    await this.role_permissionService.deleteRolePermission(
      roleId,
      permissionId
    );
    return new SuccessMsgResponse(
      await this.i18n.t('rolePermission.delete.success')
    );
  }
}
