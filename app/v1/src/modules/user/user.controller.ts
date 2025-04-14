import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  ValidationPipe,
  Req,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiSecurity,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { InviteUserDto } from './dto/inviteUser.dto';
import { Public } from 'nest-keycloak-connect';
import { SyncUserRegistrationWithKcdto } from './dto/syncUserRegistrationWithKc.dto';
import { TenantProtected } from '../auth/decorators/tenantProtected.decorator';
import { InviteEmployeeDto } from './dto/inviteEmplyee.dto';
import { USER_PATH } from './user.constants';
import { HandleErrors } from '../../common/decorators/error-handler.decorator';
import { UpdateUserDto } from './dto/updateUser.dto';
import { QueryParams } from '../../common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuccessMsgResponse } from '../../common/utils/response/response.util';
import { IUserRequest } from './interfaces/user.interface';
import { SuccessResponse } from '../../common/utils/response/response.util';
import { I18nService } from 'nestjs-i18n';
import { parseArrayFromQuery } from '../../common/utils/parsedArray.util';
import { HasPermission } from '../auth/decorators/PermissionUser.decorator';
import { PERMISSION } from '../permission/constants';
import { Permissions } from '../permission/enum/permission.enum';
import { AddUserExtraInformationDto } from './dto/extraInformationUser.dto';
import { AddWelcomeKitDto } from './dto/addWelcomeKit.dto';
import { SuperAdminGuard } from '../auth/guards/superAdmin.guard';

@ApiTags(USER_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@TenantProtected()
@Controller(USER_PATH)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService
  ) {}

  @Get()
  @HasPermission(Permissions.USERS_LIST)
  @ApiOperation({ summary: 'Get all users' })
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
    status: 200,
    description: 'List of all users',
    type: [CreateUserDto],
  })
  findAll(@Query() queryParams: QueryParams) {
    return this.userService.findUsersPaginated(queryParams);
  }
  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @Public()
  create(@Body() syncUserRegistrationWithKcdto: SyncUserRegistrationWithKcdto) {
    return this.userService.syncUserRegistrationWithKc(
      syncUserRegistrationWithKcdto
    );
  }

  @Post('invite-owner')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Invite a new user' })
  @ApiResponse({
    status: 201,
    description: 'Invitation sent successfully',
    type: InviteUserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid invitation data',
  })
  invite(@Body() inviteUserDto: InviteUserDto) {
    return this.userService.inviteOwner(inviteUserDto);
  }

  @Post('invite-employee')
  @HasPermission(Permissions.USERS_CREATE)

  @ApiOperation({ summary: 'Invite a new employee' })
  @ApiResponse({
    status: 201,
    description: 'Employee invitation sent successfully',
    type: InviteEmployeeDto,
  })
  async inviteEmployee(
    @Body() inviteEmployeeDto: InviteEmployeeDto,
  ) {
    return this.userService.inviteEmployee(inviteEmployeeDto);
  }

  @Put(':id')
  @HasPermission(Permissions.USERS_UPDATE)

  @HandleErrors({
    resource: USER_PATH,
    operation: 'put',
    i18nKey: 'users.update.error',
  })
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
 
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid update data',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUser(
    @Param('id') id: string,
    @Body(
      new ValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        validationError: { target: false, value: false },
      })
    )
    updateUserDto: UpdateUserDto,
  ) {
    const filteredDto = Object.fromEntries(
      Object.entries(updateUserDto).filter(([_, v]) => v != null)
    );

    return await this.userService.updateUserWithKeycloak(id, filteredDto);
  }

  @Delete(':organizationId/members/:userId')
  @HasPermission(Permissions.USERS_DELETE)
  @HandleErrors({
    resource: USER_PATH,
    operation: 'delete',
    i18nKey: 'users.delete.error',
  })
  @ApiOperation({ summary: 'Delete a member from organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'User ID to delete' })
  @ApiResponse({
    status: 200,
    description: 'Member deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Member or organization not found',
  })
  async deleteMemberFromOrganization(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string
  ): Promise<void> {
    await this.userService.deleteMemberFromOrganization(organizationId, userId);
  }

  @Post('/import')
  @HasPermission(Permissions.USERS_CREATE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Import users from CSV file',
    description:
      'Imports users from a CSV file and invites them to the organization. The CSV file should contain columns for userEmail, firstName, and lastName.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file containing user data',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Users successfully imported and invited',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '5 users have been invited to the organization',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - No file uploaded or invalid file format',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'No file uploaded',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during import process',
  })
  async importUsers(@UploadedFile() file: any, @Req() req: Request) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const result: any = await this.userService.importUsers(file);

    return new SuccessMsgResponse(result);
  }
  @Get('myOrganizations')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User ogranization retrieved successfully',
  })
  async getOrgs (
    @Req() req: IUserRequest,
  ){
    ;
    const organizations = await this.userService.getOrganizationsByUser(req.token)
    return organizations
  }


  @Get('me')
  @HasPermission(Permissions.USERS_READ)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiQuery({
    name: 'relations',
    type: 'array',
    required: false,
    description: 'Relations to include in the user profile',
    example: ['social'],
  })
  async getCurrentUser(
    @Req() req: IUserRequest,
    @Query('relations') relations: string | string[]
  ) {
    const parsedRelations = parseArrayFromQuery(relations);
    return await this.userService.getMe(req.user.id, parsedRelations);
  }

  @Patch('update/me')
  @HasPermission(Permissions.USERS_UPDATE)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User profile update payload',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: SuccessResponse,
  })
  @HandleErrors({
    resource: USER_PATH,
    operation: 'patch',
    i18nKey: 'users.update.error',
  })
  async updateMe(
    @Req() req: IUserRequest,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,

  ) {
    const updatedUser = await this.userService.updateUserWithKeycloak(
      req.user.id,
      updateUserDto
    );

    return new SuccessResponse(
      await this.i18n.t('users.update.success', {
        args: {
          firstName: updateUserDto.firstName || req.user.firstName,
          lastName: updateUserDto.lastName || req.user.lastName,
        },
      }),
      updatedUser
    );
  }

  @Post('welcome-kit')
  @HasPermission(Permissions.USERS_CREATE)
  @ApiOperation({ summary: 'Create a welcome kit for a user' })
  @ApiBody({
    type: AddWelcomeKitDto,
    description: 'Welcome kit details',
    examples: {
      'Full Example': {
        value: {
          email: 'fadiromdhan2@gmail.com',
          hireDateWelcome: new Date(),
          arriveTime: '09:00 AM',
          manager: 'manager-uuid-456',
          contacts: ['contact-uuid-1', 'contact-uuid-2'],
          otherInstructions: 'Provide ergonomic chair',
        },
      },
      'Minimal Example': {
        value: {
          user_id: 'user-uuid-123',
          shirt_size: 'L',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Welcome kit created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid welcome kit data',
  })
  async createWelcomeKit(
    @Body(ValidationPipe) welcomeKitData: AddWelcomeKitDto
  ) {
    return await this.userService.createWelcomekit(welcomeKitData);
  }

  @Get('welcome-kit')
  @HasPermission(Permissions.USERS_READ)
  @ApiOperation({ summary: 'Find welcome kit by email' })
  @ApiQuery({
    name: 'email',
    type: String,
    description: 'Email of the user to find welcome kit',
    required: true,
  })
  @HandleErrors({
    resource: USER_PATH,
    operation: 'get',
    i18nKey: 'users.welcomeKit.error',
  })
  async findWelcomeKitByEmail(
    @Query('email', new ValidationPipe({ transform: true })) email: string
  ) {
    const welcomeKit = await this.userService.findWelcomeKitByEmail(email);

    return new SuccessResponse(
      await this.i18n.t('users.welcomeKit.found', {
        args: { email },
      }),
      welcomeKit
    );
  }
}
