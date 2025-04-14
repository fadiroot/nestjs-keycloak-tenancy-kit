import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryParams } from '../../common/dto/pagination.dto';
import { RoleRepository } from './role.repository';
import { I18nService } from 'nestjs-i18n';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { ROLE_PATH } from './constants';
import { BaseService } from '../../common/helpers/baseService.helper';

@Injectable()
export class RoleService extends BaseService {
  constructor(
    private readonly i18n: I18nService,
    private readonly roleRepository: RoleRepository
  ) {
    super();
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const role = await this.roleRepository.findRoleByName(createRoleDto.name);
    if (role) {
      throw new BadRequestException(this.i18n, 'roles', 'role.name');
    }

    return await this.roleRepository.createRole(createRoleDto);
  }

  async getAllRoles(queryParams: QueryParams) {
    return await this.getPaginatedData(
      queryParams,
      this.roleRepository.findAllRoles.bind(this.roleRepository)
    );
  }

  async getOneRole(id: string) {
    const role = await this.roleRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(this.i18n, ROLE_PATH, id);
    }
    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(this.i18n, ROLE_PATH, id);
    }
    return await this.roleRepository.updateRole(id, updateRoleDto);
  }

  async deleteRole(id: string) {
    const role = await this.roleRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(this.i18n, ROLE_PATH, id);
    }
    await this.roleRepository.deleteRole(id);
    return role;
  }
  

}
