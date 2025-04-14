import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionRepository } from './permission.repository';
import { I18nService } from 'nestjs-i18n';
import {
  BadRequestException,
  NotFoundException,
} from '../../common/exceptions/application.exceptions';
import { PERMISSION_PATH } from './constants';
import { BaseService } from '../../common/helpers/baseService.helper';
import { QueryParams } from '../../common/dto/pagination.dto';

@Injectable()
export class PermissionService extends BaseService {
  constructor(
    private readonly i18n: I18nService,
    private readonly permissionRepository: PermissionRepository
  ) {
    super();
  }

  async createPermission(createPermissionDto: CreatePermissionDto) {
    let translatedMessage;
    const permission = await this.permissionRepository.findPermissionByName(
      createPermissionDto.name
    );
    if (permission) {
      translatedMessage = await this.i18n.t(
        'permissions.validation.permission.name.alreadyExists',
        { args: { name: createPermissionDto.name } }
      );
      throw new BadRequestException(
        this.i18n,
        'Permissions',
        'permission.name'
      );
    }

    await this.permissionRepository.createPermission(createPermissionDto);
    return await this.permissionRepository.findPermissionByName(
      createPermissionDto.name
    );
  }

  async getAllPermissions(queryParams: QueryParams) {
    return await this.getPaginatedData(
      queryParams,
      this.permissionRepository.findAllPermissions.bind(
        this.permissionRepository
      )
    );
  }

  async getAllResourcePermissions(queryParams: QueryParams) {
    return await this.getPaginatedData(
      queryParams,
      this.permissionRepository.findAllResourcePermissions.bind(
        this.permissionRepository
      )
    );
  }

  async getOnePermission(id: string) {
    const permission = await this.permissionRepository.findPermissionById(id);
    if (!permission) {
      throw new NotFoundException(this.i18n, PERMISSION_PATH, id);
    }
    return permission;
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findPermissionById(id);
    if (!permission) {
      throw new NotFoundException(this.i18n, PERMISSION_PATH, id);
    }
    return await this.permissionRepository.updatePermission(
      id,
      updatePermissionDto
    );
  }

  async deletePermission(id: string) {
    const permission = await this.permissionRepository.findPermissionById(id);
    if (!permission) {
      throw new NotFoundException(this.i18n, PERMISSION_PATH, id);
    }
    await this.permissionRepository.deletePermission(id);
    return permission;
  }
}
