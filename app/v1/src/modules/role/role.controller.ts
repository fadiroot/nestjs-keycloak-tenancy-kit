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
  ValidationPipe,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
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
import { ROLE_PATH } from './constants';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryParams } from '../../common/dto/pagination.dto';
import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { I18n, I18nService } from 'nestjs-i18n';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import { TenantProtected } from '../auth/decorators/tenantProtected.decorator';
import { HasPermission } from '../auth/decorators/PermissionUser.decorator';
import { Permissions } from '../permission/enum/permission.enum';

@ApiTags(ROLE_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@TenantProtected()
@Controller(ROLE_PATH)
export class RoleController {
  constructor(
    @I18n() private readonly i18n: I18nService,
    private readonly roleService: RoleService
  ) { }

  @Post()
  @HasPermission(Permissions.ROLES_CREATE)
  @HandleErrors({
    resource: ROLE_PATH,
    operation: 'post',
    i18nKey: 'roles.create.error',
  })
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({
    type: CreateRoleDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid role data provided',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Role with this name already exists',
  })
  async createRole(@Body(ValidationPipe) createRoleDto: CreateRoleDto) {
    const role = await this.roleService.createRole(createRoleDto);
    return new SuccessResponse(
      await this.i18n.t('roles.create.success'),
      role,
      HttpStatus.CREATED
    );
  }

  @Get()
  @HasPermission(Permissions.ROLES_LIST)
  @HandleErrors({
    resource: ROLE_PATH,
    operation: 'get',
    i18nKey: 'roles.getAll.error',
  })
  @ApiOperation({ summary: 'Get all roles' })
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
    name: 'search',
    type: String,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllRoles(@Query() queryParams: QueryParams) {
    const { docs, meta } = await this.roleService.getAllRoles(queryParams);
    return new SuccessResponsePaginate(
      await this.i18n.t('roles.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':id')
  @HasPermission(Permissions.ROLES_READ)
  @HandleErrors({
    resource: ROLE_PATH,
    operation: 'get',
    i18nKey: 'roles.get.error',
  })
  @ApiOperation({ summary: 'Get a role by id' })
  @ApiParam({
    name: 'id',
    description: 'Role identifier',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
  })
  async getRole(@Param('id') id: string) {
    const role = await this.roleService.getOneRole(id);
    return new SuccessResponse(
      await this.i18n.t('roles.get.success', {
        args: { name: role.name },
      }),
      role
    );
  }

  @Patch(':id')
  @HasPermission(Permissions.ROLES_UPDATE)
  @HandleErrors({
    resource: ROLE_PATH,
    operation: 'patch',
    i18nKey: 'roles.update.error',
  })
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({
    name: 'id',
    description: 'Role identifier',
    example: 1,
  })
  @ApiBody({
    type: UpdateRoleDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Role name already exists',
  })
  async updateRole(
    @Param('id') id: string,
    @Body(ValidationPipe) updateRoleDto: UpdateRoleDto
  ) {
    const updatedRole = await this.roleService.updateRole(id, updateRoleDto);
    return new SuccessResponse(
      await this.i18n.t('roles.update.success', {
        args: { name: updatedRole.name },
      }),
      updatedRole
    );
  }

  @Delete(':id')
  @HasPermission(Permissions.ROLES_DELETE)
  @HandleErrors({
    resource: ROLE_PATH,
    operation: 'delete',
    i18nKey: 'roles.delete.error',
  })
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({
    name: 'id',
    description: 'Role identifier',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Role cannot be deleted due to existing references',
  })
  async deleteRole(@Param('id') id: string) {
    const role = await this.roleService.deleteRole(id);
    return new SuccessMsgResponse(
      await this.i18n.t('roles.delete.success', {
        args: { name: role.name },
      })
    );
  }
}
