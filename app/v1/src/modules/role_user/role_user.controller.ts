import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { RoleUserService } from './role_user.service';
import { CreateRoleUserDto } from './dto/create-role_user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ROLE_USER_PATH } from './constants';
import { UpdateRoleUserDto } from './dto/update-role_user.dto';
import {
  SuccessMsgResponse,
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { I18n, I18nService, I18nValidationPipe } from 'nestjs-i18n';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import { QueryParams } from '../../common/dto/pagination.dto';

@ApiTags(ROLE_USER_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller(ROLE_USER_PATH)
export class RoleUserController {
  constructor(
    @I18n() private readonly i18n: I18nService,
    private readonly role_userService: RoleUserService
  ) {}

  @Post()
  @HandleErrors({
    resource: ROLE_USER_PATH,
    operation: 'post',
    i18nKey: 'roleUser.create.error',
  })
  @ApiOperation({ summary: 'Create a new role_user' })
  @ApiBody({
    type: [CreateRoleUserDto],
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'RoleUser created successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid role_user data provided',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'RoleUser with this name already exists',
  })
  async createRoleUser(
    @Body(ValidationPipe) createRoleUserDto: CreateRoleUserDto[]
  ) {
    const role_user =
      await this.role_userService.createRoleUser(createRoleUserDto);
    return new SuccessResponse(
      await this.i18n.t('roleUser.create.success'),
      role_user,
      HttpStatus.CREATED
    );
  }

  @Get()
  @HandleErrors({
    resource: ROLE_USER_PATH,
    operation: 'get',
    i18nKey: 'roleUser.getAll.error',
  })
  @ApiOperation({ summary: 'Get all roleUser' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'RoleUsers retrieved successfully',
    type: SuccessResponsePaginate,
  })
  async getAllRoleUsers(@Query() queryParams: QueryParams) {
    const { docs, meta } =
      await this.role_userService.getAllRoleUsers(queryParams);
    return new SuccessResponsePaginate(
      await this.i18n.t('roleUser.getAll.success'),
      docs,
      meta
    );
  }

  @Get(':id')
  @HandleErrors({
    resource: ROLE_USER_PATH,
    operation: 'get',
    i18nKey: 'roleUser.get.error',
  })
  @ApiOperation({ summary: 'Get a role_user by id' })
  @ApiParam({
    name: 'id',
    description: 'RoleUser identifier',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'RoleUser retrieved successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RoleUser not found',
  })
  async getRoleUser(@Param('id') id: string) {
    const role_user = await this.role_userService.getOneRoleUser(id);

    return new SuccessResponse(
      await this.i18n.t('roleUser.get.success'),
      role_user
    );
  }

  @Patch(':id')
  @HandleErrors({
    resource: ROLE_USER_PATH,
    operation: 'patch',
    i18nKey: 'roleUser.update.error',
  })
  @ApiOperation({ summary: 'Update a role_user' })
  @ApiParam({
    name: 'id',
    description: 'RoleUser identifier',
    example: 1,
  })
  @ApiBody({
    type: UpdateRoleUserDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'RoleUser updated successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RoleUser not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'RoleUser name already exists',
  })
  async updateRoleUser(
    @Param('id') id: string,
    @Body(ValidationPipe) updateRoleUserDto: UpdateRoleUserDto
  ) {
    const updatedRoleUser = await this.role_userService.updateRoleUser(
      id,
      updateRoleUserDto
    );
    return new SuccessResponse(
      await this.i18n.t('roleUser.update.success'),
      updatedRoleUser
    );
  }

  @Delete(':id')
  @HandleErrors({
    resource: ROLE_USER_PATH,
    operation: 'delete',
    i18nKey: 'roleUser.delete.error',
  })
  @ApiOperation({ summary: 'Delete a role_user' })
  @ApiParam({
    name: 'id',
    description: 'RoleUser identifier',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'RoleUser deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RoleUser not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'RoleUser cannot be deleted due to existing references',
  })
  async deleteRoleUser(@Param('id') id: string) {
    const role_user = await this.role_userService.deleteRoleUser(id);
    return new SuccessMsgResponse(await this.i18n.t('roleUser.delete.success'));
  }
}
