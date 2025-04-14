import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionController } from './rolePermission.controller';
import { RolePermissionService } from './rolePermission.service';
import { CreateRolePermissionDto } from './dto/createrolePermission.dto';
import { UpdateRolePermissionDto } from './dto/updateRolePermission.dto';
import {
  SuccessResponse,
  SuccessResponsePaginate,
  SuccessMsgResponse,
} from '../../common/utils/response/response.util';
import { I18nService } from 'nestjs-i18n';

describe('RolePermissionController', () => {
  let controller: RolePermissionController;
  let service: RolePermissionService;
  let i18n: I18nService;

  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolePermissionController],
      providers: [
        {
          provide: RolePermissionService,
          useValue: {
            createRolePermission: jest.fn(),
            getAllRolePermissions: jest.fn(),
            getOneRolePermission: jest.fn(),
            updateRolePermission: jest.fn(),
            deleteRolePermission: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => key),
          },
        },
      ],
    }).compile();

    controller = module.get<RolePermissionController>(RolePermissionController);
    service = module.get<RolePermissionService>(RolePermissionService);
    i18n = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRolePermission', () => {
    it('should create a new role permission', async () => {
      const createRolePermissionDto = [new CreateRolePermissionDto()];
      createRolePermissionDto[0].roleId = mockUuid;
      createRolePermissionDto[0].permissionId = mockUuid;

      const mockCreatedRolePermission = {
        roleId: mockUuid,
        permissionId: mockUuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(service, 'createRolePermission')
        .mockResolvedValue(mockCreatedRolePermission as any);

      const result = await controller.createRolePermission(
        createRolePermissionDto
      );

      expect(service.createRolePermission).toHaveBeenCalledWith(
        createRolePermissionDto
      );
      expect(result).toEqual(
        new SuccessResponse(
          'rolePermission.create.success',
          mockCreatedRolePermission,
          201
        )
      );
    });
  });

  describe('getAllRolePermissions', () => {
    it('should retrieve a paginated list of role permissions', async () => {
      const rolePermissions = [
        {
          roleId: mockUuid,
          permissionId: mockUuid,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: mockUuid,
          permissionId: mockUuid,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const paginationMeta = { total: 2, page: 1, limit: 10 };
      jest.spyOn(service, 'getAllRolePermissions').mockResolvedValue({
        docs: rolePermissions,
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

      const result = await controller.getAllRolePermissions({
        page: 1,
        limit: 10,
      });

      expect(result);
      expect(service.getAllRolePermissions).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getRolePermission', () => {
    it('should retrieve a role permission by id', async () => {
      const rolePermission = {
        roleId: mockUuid,
        permissionId: mockUuid,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      jest
        .spyOn(service, 'getOneRolePermission')
        .mockResolvedValue(rolePermission);

      const result = await controller.getRolePermission(mockUuid, mockUuid);

      expect(service.getOneRolePermission).toHaveBeenCalledWith(mockUuid,mockUuid);
      expect(result).toEqual(
        new SuccessResponse('rolePermission.get.success', rolePermission)
      );
    });
  });

  describe('updateRolePermission', () => {
    it('should update a role permission', async () => {
      const updateRolePermissionDto = new UpdateRolePermissionDto();
      updateRolePermissionDto.roleId = mockUuid;

      const updatedRolePermission = {
        roleId: mockUuid,
        permissionId: mockUuid,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      jest
        .spyOn(service, 'updateRolePermission')
        .mockResolvedValue(updatedRolePermission);

      const result = await controller.updateRolePermission(mockUuid, [
        updateRolePermissionDto,
      ]);

      expect(service.updateRolePermission).toHaveBeenCalledWith(
        mockUuid,
        [updateRolePermissionDto]
      );
      expect(result).toEqual(
        new SuccessResponse(
          'rolePermission.update.success',
          updatedRolePermission
        )
      );
    });
  });

  describe('deleteRolePermission', () => {
    it('should delete a role permission', async () => {
      const deletedRolePermission = {
        roleId: mockUuid,
        permissionId: mockUuid,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      jest
        .spyOn(service, 'deleteRolePermission')
        .mockResolvedValue(deletedRolePermission);

      const result = await controller.deleteRolePermission(mockUuid, mockUuid);

      expect(service.deleteRolePermission).toHaveBeenCalledWith(mockUuid,mockUuid);
      expect(result).toEqual(
        new SuccessMsgResponse('rolePermission.delete.success')
      );
    });
  });
});
