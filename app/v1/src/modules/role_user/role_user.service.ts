import { Injectable } from '@nestjs/common';
import { CreateRoleUserDto } from './dto/create-role_user.dto';
import { UpdateRoleUserDto } from './dto/update-role_user.dto';
import { RoleUserRepository } from './role_user.repository';
import { I18nService } from 'nestjs-i18n';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { ROLE_USER_PATH } from './constants';
import { BaseService } from '../../common/helpers/baseService.helper';
import { QueryParams } from '../../common/dto/pagination.dto';

@Injectable()
export class RoleUserService extends BaseService {
  constructor(
    private readonly i18n: I18nService,
    private readonly role_userRepository: RoleUserRepository
  ) {
    super();
  }

  async createRoleUser(createRoleUserDto: CreateRoleUserDto[]) {
    return await this.role_userRepository.createRoleUser(createRoleUserDto);
  }

  async getAllRoleUsers(queryParams: QueryParams) {
    return await this.getPaginatedData(
      queryParams,
      this.role_userRepository.findAllRoleUsers.bind(this.role_userRepository)
    );
  }

  async getOneRoleUser(id: string) {
    const role_user = await this.role_userRepository.findRoleUserById(id);
    if (!role_user) {
      throw new NotFoundException(this.i18n, ROLE_USER_PATH, id);
    }
    return role_user;
  }

  async updateRoleUser(id: string, updateRoleUserDto: UpdateRoleUserDto) {
    const role_user = await this.role_userRepository.findRoleUserById(id);
    if (!role_user) {
      throw new NotFoundException(this.i18n, ROLE_USER_PATH, id);
    }
    return await this.role_userRepository.updateRoleUser(id, updateRoleUserDto);
  }

  async deleteRoleUser(id: string) {
    const role_user = await this.role_userRepository.findRoleUserById(id);
    if (!role_user) {
      throw new NotFoundException(this.i18n, ROLE_USER_PATH, id);
    }
    await this.role_userRepository.deleteRoleUser(id);
    return role_user;
  }
}
