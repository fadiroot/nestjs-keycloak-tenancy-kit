import { Injectable } from '@nestjs/common';
import { CreateRolePermissionDto } from './dto/createrolePermission.dto';
import { UpdateRolePermissionDto } from './dto/updateRolePermission.dto';
import { RolePermissionRepository } from './rolePermission.repository';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '../../common/exceptions/application.exceptions';
import { ROLE_PERMISSION_PATH } from './constants';
import { BaseService } from '../../common/helpers/baseService.helper';
import { QueryParams } from '../../common/dto/pagination.dto';

@Injectable()
export class RolePermissionService extends BaseService {
  constructor(
    private readonly i18n: I18nService,
    private readonly rolePermissionRepository: RolePermissionRepository
  ) {
    super();
  }

  async createRolePermission(
    createRolePermissionDto: CreateRolePermissionDto[]
  ) {
    return await this.rolePermissionRepository.createRolePermission(
      createRolePermissionDto
    );
  }

  async getAllRolePermissions(queryParams: QueryParams) {
    return await this.getPaginatedData(
      queryParams,
      this.rolePermissionRepository.findAllRolePermissions.bind(
        this.rolePermissionRepository
      )
    );
  }
  async getPermissionsByRoleId(roleId: string) {
    return await this.rolePermissionRepository.findPermissionsByRoleId(roleId);
  }

  async getOneRolePermission(roleId: string, permissionId: string) {
    const role_permission =
      await this.rolePermissionRepository.findRolePermissionByRoleIdWithPermissionId(
        roleId,
        permissionId
      );
    if (!role_permission) {
      throw new NotFoundException(
        this.i18n,
        ROLE_PERMISSION_PATH,
        `${roleId} , ${permissionId}`
      );
    }
    return role_permission;
  }

  async updateRolePermission(
    roleId: string,
    updateRolePermissionDto: UpdateRolePermissionDto[]
  ) {
    const inputPermissionIds = updateRolePermissionDto.map(
      (row) => row.permissionId
    );
    const existingRolePermissions =
      await this.rolePermissionRepository.findAllRolePermissionsByRoleId(
        roleId
      );
    const existingPermissionIds = existingRolePermissions.map(
      (rolePermission) => rolePermission.permissionId
    );
    const toCreate = inputPermissionIds.filter(
      (permissionId) => !existingPermissionIds.includes(permissionId)
    );

    const toDelete = existingPermissionIds.filter(
      (permissionId) => !inputPermissionIds.includes(permissionId)
    );

    if (toCreate.length > 0) {
      const createRolePermissionsDto = toCreate.map((permissionId) => ({
        roleId,
        permissionId,
      }));
      await this.rolePermissionRepository.createRolePermission(
        createRolePermissionsDto
      );
    }

    if (toDelete.length > 0) {
      await Promise.all(
        toDelete.map((permissionId) =>
          this.rolePermissionRepository.deleteRolePermission(
            roleId,
            permissionId
          )
        )
      );
    }

    const updatedRolePermissions =
      await this.rolePermissionRepository.findAllRolePermissionsByRoleId(
        roleId
      );

    return updatedRolePermissions;
  }

  async deleteRolePermission(roleId: string, permissionId: string) {
    const role_permission =
      await this.rolePermissionRepository.findRolePermissionByRoleIdWithPermissionId(
        roleId,
        permissionId
      );
    if (!role_permission) {
      throw new NotFoundException(
        this.i18n,
        ROLE_PERMISSION_PATH,
        `${roleId} , ${permissionId}`
      );
    }
    await this.rolePermissionRepository.deleteRolePermission(
      roleId,
      permissionId
    );
    return role_permission;
  }
}
