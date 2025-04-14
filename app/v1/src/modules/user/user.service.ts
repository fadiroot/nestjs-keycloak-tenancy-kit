import {
  Injectable,
  Global,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { NotFoundException } from '../../common/exceptions/application.exceptions';
import { UserRepository } from './repositories/user.repository';
import { user, UserMapper } from './interfaces/user.interface';
import { CreateUserDto } from './dto/createUser.dto';
import { SyncUserRegistrationWithKcdto } from './dto/syncUserRegistrationWithKc.dto';
import { KeycloakTenantService } from '../../tenants/services/keycloakTenant.service';
import { EmploymentStatus, InviteEmployeeDto } from './dto/inviteEmplyee.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { DatabaseException } from '../../common/exceptions/application.exceptions';
import { BaseException } from '../../common/exceptions/base.exception';
import { I18nService } from 'nestjs-i18n';
import { QueryParams } from '../../common/dto/pagination.dto';
import { BaseService } from '../../common/helpers/baseService.helper';
import { CurrentTenantService } from '../../tenants/services/currentTenant.service';
import { entitiesTablesAndColumnsNames } from '../statistics/enums/entityEnum';
import { EducationRepository } from './repositories/education.repository';
import { VisaRepository } from './repositories/visa.repository';
import { EmergencyRepository } from './repositories/emergency.repository';
import { UserExtraInformationRepository } from './repositories/userExtraInformation.repository';
import { UserSocialLinksRepository } from './repositories/userSocialLinks.repository';
import { userRelations } from './enum/userEntiiesOptions.dto';
import { DepartmentService } from '../department/department.service';
import { AddWelcomeKitDto } from './dto/addWelcomeKit.dto';
import { USERS_DROPBOX } from './user.constants';
import { TenantService } from '../../tenants/tenant.service';
@Global()
@Injectable()
export class UserService extends BaseService {
  private readonly logger = new Logger(UserService.name);
  private updateLeaveBalancesTimeout: NodeJS.Timeout;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly educationRepository: EducationRepository,
    private readonly keycloakTenantService: KeycloakTenantService,
    private readonly currentTenantService: CurrentTenantService,
    @Inject(forwardRef(() => DepartmentService))
    private readonly i18n: I18nService,
    private readonly visaRepository: VisaRepository,
    private readonly emergencyRepository: EmergencyRepository,
    private readonly userExtraInformationRepository: UserExtraInformationRepository,
    private readonly userSocialLinksRepository: UserSocialLinksRepository,
    private readonly tenantService : TenantService

  ) {
    super();
  }

  async findUsersPaginated(queryParams: QueryParams) {
    try {
      this.userRepository.updateLeaveBalances();
      const users = await this.getPaginatedData(
        queryParams,
        this.userRepository.findUsersPaginated.bind(this.userRepository)
      );
      return users;
    } catch (error: any) {
      throw new DatabaseException(this.i18n, 'find', 'users', error);
    }
  }
  async findAll(users?): Promise<user.selectable[]> {
    try {
      return await this.userRepository.findAll(users);
    } catch (error: any) {
      throw new DatabaseException(this.i18n, 'find', 'users', error);
    }
  }

  async findById(id: string): Promise<user.selectable | null> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException(this.i18n, 'user', id);
      }
      return user;
    } catch (error: any) {
      if (error instanceof BaseException) throw error;
      throw new DatabaseException(this.i18n, 'find', 'user', error);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<user.selectable> {
    return await this.userRepository.create(createUserDto);
  }

  async update(id: string, userData: object) {
    return await this.userRepository.update(id, userData);
  }
  updateUsersWithIds(obj: object, users: string[]): Promise<any> {
    return this.userRepository.updateUsersWithIds(obj, users);
  }

  async delete(id: string): Promise<void> {
    return await this.userRepository.delete(id);
  }

  async syncUserRegistrationWithKc(
    syncUserRegistrationWithKcdto: SyncUserRegistrationWithKcdto
  ) {
    try {
      const pendingUser =
        await this.userRepository.findUserFromPendingUsersByEmail(
          syncUserRegistrationWithKcdto.email
        );

      const mergedData: CreateUserDto = {
        ...UserMapper.toInsertable(syncUserRegistrationWithKcdto),
        organization_id: pendingUser.organization_id,
        department_id: pendingUser.department_id || null,
        location_id: pendingUser.location_id || null,
        role_id: pendingUser.role_id || null,
        employment_status: pendingUser.employment_status || null,
        mobile_phone_number: pendingUser.mobile_phone_number || null,
        work_phone_number: pendingUser.work_phone_number || null,
        birthday: pendingUser.birthday || null,
        country: pendingUser.country,
        hire_date: pendingUser.hire_date,
        social_security_number: pendingUser.social_security_number || null,
        gender: pendingUser.gender || null,
        marital_status: pendingUser.marital_status,
        street_name: pendingUser.street_name,
        state: pendingUser.state,
        zip: pendingUser.zip,
        img_url: pendingUser.img_url,
        pay_schedule: pendingUser.pay_schedule,
        per_type: pendingUser.per_type,
        pay_rate: pendingUser.pay_rate,
        pay_type: pendingUser.pay_type,
        job_title: pendingUser.job_title,
        status: 'active',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      console.log('mergeed data : ', mergedData);
      const createdUser = await this.userRepository.create(mergedData);

      this.logger.log(
        `Successfully synced user: ${syncUserRegistrationWithKcdto.email}`
      );

      return createdUser;
    } catch (error: any) {
      if (error instanceof BaseException) throw error;
      throw new DatabaseException(
        this.i18n,
        'sync',
        'user registration',
        error
      );
    }
  }

  async inviteEmployee(
    inviteEmployeeDto: InviteEmployeeDto,
    file?
  ): Promise<user.selectable | any> {
    try {
      const isInvitedUser =
        await this.userRepository.findUserFromPendingUsersByEmail(
          inviteEmployeeDto.email
        );
      if (isInvitedUser) {
        throw new BadRequestException(
          this.i18n.t('users.inviteEmployee.error.userAlreadyInvited')
        );
      }

      const invitationResult =
        await this.keycloakTenantService.inviteUserToOrganization(
          inviteEmployeeDto
        );

      if (invitationResult.status === 204) {
        const invitedUser =
          await this.userRepository.registerPendingUser(inviteEmployeeDto);
        return invitedUser;
      } else {
        throw new BaseException('Invitation to organization failed');
      }
    } catch (error: any) {
      if (error.message === 'Failed to send invite email') {
        throw new BadRequestException(
          this.i18n.t('users.inviteEmployee.error.failedEmailInvitation')
        );
      }

      if (error instanceof BaseException) throw error;

      if (
        error.response?.statusCode === 409 ||
        error.message.includes('already been invited')
      ) {
        throw new BadRequestException(
          this.i18n.t('users.inviteEmployee.error.userAlreadyInvited')
        );
      }

      throw new DatabaseException(this.i18n, 'invite', 'employee', error);
    }
  }
  async inviteOwner(inviteData: {
    organizationId: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
  }) {
    try {
      const roleAdminId = await this.userRepository.roleAdmin('super-admin');
      const departmentAdminId =
        await this.userRepository.departmentAdmin('administration');
      const ownerInviteDto: InviteEmployeeDto = {
        organizationId: inviteData.organizationId,
        email: inviteData.email,
        firstName: inviteData.firstName,
        lastName: inviteData.lastName,
        departmentId: departmentAdminId,
        roleId: roleAdminId,
        employmentStatus: 'full-time',
        username: inviteData.username,
        country: 'country',
      };
      console.log(ownerInviteDto);

      const invitedUser = await this.inviteEmployee(ownerInviteDto);

      this.logger.log('Owner invited successfully', {
        userId: invitedUser.id,
        email: invitedUser.email,
      });

      return invitedUser;
    } catch (error) {
      this.logger.error('Error in inviteOwner', error);
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to invite organization owner'
      );
    }
  }
  async createWelcomekit(addWelcomeKitDto: AddWelcomeKitDto) {
    const { contacts, ...welcomeKitData } = addWelcomeKitDto;
    return await this.userRepository.addWelcomeKit(welcomeKitData, contacts);
  }
  async findWelcomeKitByEmail(email: string) {
    const welcomeKit =
      await this.userRepository.getWelcomeKitOfEmployeeByEmail(email);
    if (!welcomeKit) {
      throw new NotFoundException(
        this.i18n.t('users.welcomeKit.notFound', {
          args: { email },
        }),
        'users.welcomeKit.notFound',
        email
      );
    }
    return welcomeKit;
  }

  async findByEmail(email: string): Promise<user.selectable | null> {
    try {
      const user = await this.userRepository.findByEmail(email);
      return user;
    } catch (error) {
      this.logger.error('Error in findByEmail:', error);
      throw error;
    }
  }

  async updateUserWithKeycloak(
    userId: string,
    updateUserDto: UpdateUserDto,
    file?
  ) {
    try {
      const sanitizedUserId = userId.trim();

      const userExists = await this.userRepository.findById(sanitizedUserId);
      const {
        username,
        education,
        visa,
        shirtSizes,
        allergies,
        dietaryRestrictions,
        spokenLanguages,
        socialLinks,
        firstName,
        lastName,
        email,
        homeEmail,
        country,
        hireDate,
        mobilePhoneNumber,
        workPhoneNumber,
        birthday,
        employmentStatus,
        locationId,
        roleId,
        departmentId,
        maritalStatus,
        streetName,
        state,
        zip,
        gender,
        socialSecurityNumber,
        paySchedule,
        perType,
        payRate,
        payType,
        imgUrl,
        isFirstLogin,
        emergencyContact,
        jobTitle,
      } = updateUserDto;

      if (!userExists) {
        throw new NotFoundException(this.i18n, 'user', userId);
      }

      if (education) {
        await this.educationRepository.addMultipleEducationsForUser(
          userId,
          education
        );
      }

      if (visa) {
        await this.visaRepository.addMultipleVisasForUser(userId, visa);
      }

      if (emergencyContact) {
        await this.emergencyRepository.addMultipleEmergenciesForUser(
          userId,
          emergencyContact
        );
      }

      if (shirtSizes || allergies || dietaryRestrictions || spokenLanguages) {
        await this.userExtraInformationRepository.addOrUpdateUserExtraInformation(
          {
            user_id: sanitizedUserId,
            shirt_size: shirtSizes,
            allergies: allergies,
            dietary_restrictions: dietaryRestrictions,
            spoken_languages: spokenLanguages,
          }
        );
      }

      if (socialLinks) {
        await this.userSocialLinksRepository.addOrUpdateUserSocialLinks(
          sanitizedUserId,
          socialLinks
        );
      }

      const needsKeycloakUpdate = !!(firstName || lastName || email);

      if (needsKeycloakUpdate) {
        await this.keycloakTenantService.updateUser(sanitizedUserId, {
          firstName: firstName,
          lastName: lastName,
          email: email,
        });
      }
      if (isFirstLogin === true) {
        await this.userRepository.deletePendingUser(userExists.email);
      }

      const localUserData: user.updateable = {
        username: username,
        first_name: firstName,
        last_name: lastName,
        email: email,
        home_email: homeEmail,
        country: country,
        hire_date: hireDate,
        mobile_phone_number: mobilePhoneNumber,
        work_phone_number: workPhoneNumber,
        birthday: birthday,
        employment_status: employmentStatus,
        location_id: locationId,
        role_id: roleId,
        department_id: departmentId,
        marital_status: maritalStatus,
        street_name: streetName,
        state: state,
        zip: zip,
        gender: gender,
        social_security_number: socialSecurityNumber,
        pay_schedule: paySchedule,
        per_type: perType,
        pay_rate: payRate,
        pay_type: payType,
        img_url: imgUrl,
        is_first_login: isFirstLogin,
        job_title: jobTitle,
        updated_at: new Date(),
      };

      // Remove undefined values
      Object.keys(localUserData).forEach(
        (key) => localUserData[key] === undefined && delete localUserData[key]
      );

      return await this.userRepository.update(sanitizedUserId, localUserData);
    } catch (error: any) {
      if (error instanceof BaseException) throw error;
      throw new DatabaseException(this.i18n, 'update', 'user', error);
    }
  }

  async deleteMemberFromOrganization(
    organizationId: string,
    userId: string
  ): Promise<void> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new NotFoundException(this.i18n, 'user', userId);
      }

      await this.keycloakTenantService.deleteMemberFromOrganization(
        organizationId,
        userId
      );
      await this.userRepository.delete(userId);
    } catch (error: any) {
      if (error instanceof BaseException) throw error;
      throw new DatabaseException(this.i18n, 'delete', 'user', error);
    }
  }

  async importUsers(file: any) {
    try {
      const csvData = file.buffer.toString('utf8');
      const rows = csvData.trim().split('\n');
      const headers = rows[0].split(';');

      const jsonData = rows.slice(1).map((row) => {
        const values = row.split(';');
        return headers.reduce((obj, header, i) => {
          obj[header.trim()] = values[i].trim();
          return obj;
        }, {});
      });
      const tenant = this.currentTenantService.getTenant();
      const failedUsers: any[] = [];
      await Promise.all(
        jsonData.map(async (user) => {
          try {
            const inviteEmployeeDto: InviteEmployeeDto = {
              organizationId: tenant.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              country: user.country,
              username: user.username || user.email,
              employmentStatus: user.employmentStatus,
              gender: user.gender,
              socialSecurityNumber: user.socialSecurityNumber,
              mobilePhoneNumber: user.mobilePhoneNumber,
              workPhoneNumber: user.workPhoneNumber,
              birthday: user.birthday ? new Date(user.birthday) : undefined,
              maritalStatus: user.maritalStatus,
              hireDate: user.hireDate ? new Date(user.hireDate) : undefined,
              homeEmail: user.homeEmail,
              locationId: user.locationId,
              roleId: user.roleId,
              departmentId: user.departmentId,
              streetName: user.streetName,
              state: user.state,
              zip: user.zip,
              perType: user.perType,
              paySchedule: user.paySchedule,
              payRate: user.payRate ? Number(user.payRate) : undefined,
              payType: user.payType,
              imgUrl: user.imgUrl,
            };
            await this.inviteEmployee(inviteEmployeeDto);
          } catch (error) {
            failedUsers.push({
              user,
              error: error,
            });
          }
        })
      );

      return {
        message: `${jsonData.length - failedUsers.length} users invited successfully`,
        failedUsers: failedUsers,
        failedUsersCount: failedUsers.length,
        totalUsers: jsonData.length,
      };
    } catch (error) {
      this.logger.error(`Error importing users: ${error}`, error);
      throw new InternalServerErrorException(error, 'Failed to import users');
    }
  }
























  async getMe(userId: string, relations: string[]) {
    const allowedRelations = Object.values(userRelations);
    const invalidRelations = relations.filter(
      (relation) => !allowedRelations.includes(relation as userRelations)
    );
    if (invalidRelations.length > 0) {
      throw new BadRequestException(
        `Invalid relations: ${invalidRelations.join(', ')}. Allowed values are: ${allowedRelations.join(', ')}`
      );
    }
    try {
      const userProfile = await this.userRepository.findUserWithRelations(userId, relations);
      const org = await this.tenantService.getTenantByOrgId(userProfile.organizationId)
      if (!userProfile) {
        throw new NotFoundException(this.i18n, 'user', userId);
      }
      return {...userProfile , org };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error retrieving user profile for user ${userId}`,
        error
      );
      throw new InternalServerErrorException(
        'An error occurred while retrieving the user profile'
      );
    }
  }
  async getOrganizationsByUser(token) {
    const organizations =
      await this.keycloakTenantService.getOrganizationsByUser(token);
    console.log(organizations);
    return organizations;
  }
}
