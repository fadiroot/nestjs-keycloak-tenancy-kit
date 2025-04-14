import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  SuccessResponse,
  SuccessResponsePaginate,
  SuccessMsgResponse,
} from '../../common/utils/response/response.util';
import { I18nService } from 'nestjs-i18n';
import { UserService } from '../user/user.service';
import { Reflector } from '@nestjs/core';
import { TenantAccessGuard } from '../auth/guards/tenantAccess.guard';
import { RolePermissionService } from '../rolePermission/rolePermission.service';
import { PermissionGuard } from '../auth/guards/permisson.guard';

describe('PermissionController', () => {
  let controller: PermissionController;
  let service: PermissionService;
  let i18n: I18nService;

  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: {
            createPermission: jest.fn(),
            getAllPermissions: jest.fn(),
            getAllResourcePermissions: jest.fn(),
            getOnePermission: jest.fn(),
            updatePermission: jest.fn(),
            deletePermission: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => key),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TenantAccessGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: RolePermissionService,
          useValue: {
            checkPermission: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: PermissionGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
    service = module.get<PermissionService>(PermissionService);
    i18n = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPermission', () => {
    it('should create a new permission', async () => {
      const createDto = new CreatePermissionDto();
      const createdPermission = {
        id: mockUuid,
        name: 'CREATE_DEPARTMENT',
        resource: 'departments',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      jest
        .spyOn(service, 'createPermission')
        .mockResolvedValue(createdPermission);

      const result = await controller.createPermission(createDto);

      expect(service.createPermission).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(
        new SuccessResponse(
          'permissions.create.success',
          createdPermission,
          201
        )
      );
    });
  });

  describe('getAllPermissions', () => {
    it('should retrieve a paginated list of permissions', async () => {
      const permissions = [
        {
          id: mockUuid,
          name: 'CREATE_DEPARTMENT',
          resource: 'departments',
        },
      ];
      jest.spyOn(service, 'getAllPermissions').mockResolvedValue({
        docs: permissions,
        meta: {
          total: 8,
          page: 1,
          limit: 10,
          totalPages: 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          hasMore: false,
        },
      });

      const result = await controller.getAllPermissions({
        page: 1,
        limit: 10,
      });

      expect(result);
      expect(service.getAllPermissions).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });
  describe('getAllResourcePermissions', () => {
    it('should retrieve a paginated list of resource permissions', async () => {
      const permissions = [
        {
          id: mockUuid,
          name: 'CREATE_DEPARTMENT',
          resource: 'departments',
        },
      ];
      jest.spyOn(service, 'getAllResourcePermissions').mockResolvedValue({
        docs: permissions,
        meta: {
          total: 8,
          page: 1,
          limit: 10,
          totalPages: 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          hasMore: false,
        },
      });

      const result = await controller.getAllResourcePermissions({
        page: 1,
        limit: 10,
      });

      expect(result);
      expect(service.getAllResourcePermissions).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getPermission', () => {
    it('should retrieve a permission by id', async () => {
      const permission = {
        id: mockUuid,
        name: 'CREATE_DEPARTMENT',
        resource: 'departments',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      jest.spyOn(service, 'getOnePermission').mockResolvedValue(permission);

      const result = await controller.getPermission(mockUuid);

      expect(service.getOnePermission).toHaveBeenCalledWith(mockUuid);
      expect(result).toEqual(
        new SuccessResponse('permissions.get.success', permission)
      );
    });
  });

  describe('updatePermission', () => {
    it('should update a permission', async () => {
      const updateDto = new UpdatePermissionDto();
      const updatedPermission = {
        id: mockUuid,
        name: 'UPDATED_DEPARTMENT',
        resource: 'departments',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      jest
        .spyOn(service, 'updatePermission')
        .mockResolvedValue(updatedPermission);

      const result = await controller.updatePermission(mockUuid, updateDto);

      expect(service.updatePermission).toHaveBeenCalledWith(
        mockUuid,
        updateDto
      );
      expect(result).toEqual(
        new SuccessResponse('permissions.update.success', updatedPermission)
      );
    });
  });

  describe('deletePermission', () => {
    it('should delete a permission', async () => {
      const deletedPermission = {
        id: mockUuid,
        name: 'DELETE_DEPARTMENT',
        resource: 'departments',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      jest
        .spyOn(service, 'deletePermission')
        .mockResolvedValue(deletedPermission);

      const result = await controller.deletePermission(mockUuid);

      expect(service.deletePermission).toHaveBeenCalledWith(mockUuid);
      expect(result).toEqual(
        new SuccessMsgResponse('permissions.delete.success')
      );
    });
  });
});
