import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { I18nService } from 'nestjs-i18n';
import { Reflector } from '@nestjs/core';
import { UserService } from '../user/user.service';
import { TenantAccessGuard } from '../auth/guards/tenantAccess.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolePermissionService } from '../rolePermission/rolePermission.service';
import { PermissionGuard } from '../auth/guards/permisson.guard';
import { HttpStatus } from '@nestjs/common';
import { SuccessResponse, SuccessMsgResponse } from '../../common/utils/response/response.util';

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;
  let i18n: I18nService;

  // Mock services
  const mockRoleService = {
    createRole: jest.fn(),
    getAllRoles: jest.fn(),
    getOneRole: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
  };

  const mockI18nService = {
    t: jest.fn().mockResolvedValue('Translated message'),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockTenantAccessGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockRolePermissionService = {
    checkPermission: jest.fn().mockResolvedValue(true),
  };

  const mockPermissionGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: UserService, useValue: mockUserService },
        { provide: Reflector, useValue: mockReflector },
        { 
          provide: APP_GUARD, 
          useValue: mockTenantAccessGuard 
        },
        {
          provide: TenantAccessGuard,
          useValue: mockTenantAccessGuard,
        },
        {
          provide: RolePermissionService,
          useValue: mockRolePermissionService,
        },
        {
          provide: PermissionGuard,
          useValue: mockPermissionGuard,
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    service = module.get<RoleService>(RoleService);
    i18n = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const createRoleDto = {
        name: 'Test Role',
        annualLeaveDays: 20 ,
        description: 'Test Description',
        permissions: ['test:permission'],
      };

      const createdRole = {
        id: '123',
        ...createRoleDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRoleService.createRole.mockResolvedValue(createdRole);

      const result = await controller.createRole(createRoleDto);

      expect(mockRoleService.createRole).toHaveBeenCalledWith(createRoleDto);
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.message).toBe('Translated message');
      expect(result.code).toBe(HttpStatus.CREATED);
    });
  });

  describe('getAllRoles', () => {
    it('should retrieve a paginated list of roles', async () => {
      const roles = [
        { 
          id: '123', 
          name: 'Admin Role', 
          description: 'Admin Description' 
        }
      ];
      const meta = {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockRoleService.getAllRoles.mockResolvedValue({
        docs: roles,
        meta,
      });

      const result = await controller.getAllRoles({
        page: 1,
        limit: 10,
      });

      expect(mockRoleService.getAllRoles).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result.message).toBe('Translated message');
 
    });
  });

  describe('getRole', () => {
    it('should retrieve a role by id', async () => {
      const role = {
        id: '123',
        name: 'Test Role',
        description: 'Test Description',
      };

      mockRoleService.getOneRole.mockResolvedValue(role);

      const result = await controller.getRole('123');

      expect(mockRoleService.getOneRole).toHaveBeenCalledWith('123');
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.message).toBe('Translated message');
    });
  });

  describe('updateRole', () => {
    it('should update a role', async () => {
      const updateRoleDto = {
        name: 'Updated Role',
        description: 'Updated Description',
      };

      const updatedRole = {
        id: '123',
        ...updateRoleDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRoleService.updateRole.mockResolvedValue(updatedRole);

      const result = await controller.updateRole('123', updateRoleDto);

      expect(mockRoleService.updateRole).toHaveBeenCalledWith('123', updateRoleDto);
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.message).toBe('Translated message');
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      const deletedRole = {
        id: '123',
        name: 'Deleted Role',
        description: 'Deleted Description',
      };

      mockRoleService.deleteRole.mockResolvedValue(deletedRole);

      const result = await controller.deleteRole('123');

      expect(mockRoleService.deleteRole).toHaveBeenCalledWith('123');
      expect(result).toBeInstanceOf(SuccessMsgResponse);
      expect(result.message).toBe('Translated message');
    });
  });
});