import { HttpStatus } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import {
  SuccessResponse,
  SuccessResponsePaginate
} from '../../common/utils/response/response.util';
import { CreateLeaveTypeDto } from './dto/createLeaveTypes.dto';
import { UpdateLeaveTypeDto } from './dto/updateLeaveTypes.dto';
import {
  YearlyQuotaType,
  YearlyQuotaUnit,
  AssignToType,
} from './enums/leaveTypes.enum';
import { LeaveTypesController } from './leaveTypes.controller';
import { LeaveTypesService } from './leaveTypes.service';
import { Reflector } from '@nestjs/core';
import { UserService } from '../user/user.service';
import { TenantAccessGuard } from '../auth/guards/tenantAccess.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolePermissionService } from '../rolePermission/rolePermission.service';
import { PermissionGuard } from '../auth/guards/permisson.guard';
import { SuccessMsgResponse } from '../../common/utils/response/response.util';

describe('LeaveTypesController', () => {
  let controller: LeaveTypesController;
  let service: LeaveTypesService;
  let i18n: I18nService;

  const mockLeaveTypesService = {
    createLeaveType: jest.fn(),
    getAllLeaveTypes: jest.fn(),
    getOneLeaveType: jest.fn(),
    updateLeaveType: jest.fn(),
    deleteLeaveType: jest.fn(),
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
      controllers: [LeaveTypesController],
      providers: [
        { provide: LeaveTypesService, useValue: mockLeaveTypesService },
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

    controller = module.get<LeaveTypesController>(LeaveTypesController);
    service = module.get<LeaveTypesService>(LeaveTypesService);
    i18n = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLeaveType', () => {
    it('should create a new leave type', async () => {
      const createDto: CreateLeaveTypeDto = {
        name: 'Sick Leave',
        icon: 1,
        yearlyQuotaType: YearlyQuotaType.UNLIMITED,
        yearlyQuotaValue: 0,
        yearlyQuotaUnit: YearlyQuotaUnit.DAYS,
        allowNegativeBalance: false,
        reasonRequired: true,
        subtractWeekends: false,
        departments: ['1'],
        locations: ['1'],
        assignToType: AssignToType.DEPARTMENTS,
        employees: ['1'],
      };

      const createdLeaveType = {
        id: '123',
        ...createDto,
      };

      mockLeaveTypesService.createLeaveType.mockResolvedValue(createdLeaveType);

      const result = await controller.createLeaveType(createDto);

      expect(mockLeaveTypesService.createLeaveType).toHaveBeenCalledWith(createDto);
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.message).toBe('Translated message');
      expect((result as any).data).toEqual(createdLeaveType);
      expect(result.code).toBe(HttpStatus.CREATED);
    });
  });

  describe('getAllLeaveTypes', () => {
    it('should return all leave types', async () => {
      const leaveTypes = [
        {
          id: '123',
          name: 'Sick Leave',
        },
      ];
      const meta = { page: 1, limit: 10, total: 1 };
      mockLeaveTypesService.getAllLeaveTypes.mockResolvedValue({
        docs: leaveTypes,
        meta,
      });

      const result = await controller.getAllLeaveTypes({
        page: 0,
        limit: 0,
      });

      expect(mockLeaveTypesService.getAllLeaveTypes).toHaveBeenCalled();
      expect(result).toBeInstanceOf(SuccessResponsePaginate);
      expect(result.message).toBe('Translated message');
      expect((result as any).meta).toEqual(meta);
    });
  });

  describe('getLeaveType', () => {
    it('should return a specific leave type', async () => {
      const leaveType = {
        id: '123',
        name: 'Sick Leave',
        yearlyQuotaType: YearlyQuotaType.UNLIMITED,
        yearlyQuotaValue: 0,
        yearlyQuotaUnit: YearlyQuotaUnit.DAYS,
        allowNegativeBalance: false,
        reasonRequired: true,
        subtractWeekends: false,
      };
      mockLeaveTypesService.getOneLeaveType.mockResolvedValue(leaveType);

      const result = await controller.getLeaveType('123');

      expect(mockLeaveTypesService.getOneLeaveType).toHaveBeenCalledWith('123');
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.message).toBe('Translated message');
      expect((result as any).data).toEqual(leaveType);
    });
  });

  describe('updateLeaveType', () => {
    it('should update a leave type', async () => {
      const updateDto: UpdateLeaveTypeDto = {
        name: 'Updated Name',
      };
      const updatedLeaveType = { id: '123', ...updateDto };
      mockLeaveTypesService.updateLeaveType.mockResolvedValue(updatedLeaveType);

      const result = await controller.updateLeaveType('123', updateDto);

      expect(mockLeaveTypesService.updateLeaveType).toHaveBeenCalledWith(
        '123',
        updateDto
      );
      expect(result).toBeInstanceOf(SuccessResponse);
      expect(result.message).toBe('Translated message');
      expect((result as any).data).toEqual(updatedLeaveType);
    });
  });

  describe('deleteLeaveType', () => {
    it('should delete a leave type', async () => {
      const deletedLeaveType = {
        id: '123',
        name: 'Sick Leave',
      };
      mockLeaveTypesService.deleteLeaveType.mockResolvedValue(deletedLeaveType);

      const result = await controller.deleteLeaveType('123');

      expect(mockLeaveTypesService.deleteLeaveType).toHaveBeenCalledWith('123');
      expect(result).toBeInstanceOf(SuccessMsgResponse);
      expect(result.message).toBe('Translated message');
    });
  });
});
