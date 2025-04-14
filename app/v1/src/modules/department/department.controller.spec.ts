import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { UpdateDepartmentDto } from './dto/updateDepartment.dto';
import { I18nService } from 'nestjs-i18n';
import { HttpStatus } from '@nestjs/common';
import { SuccessResponse } from '../../common/utils/response/response.util';
import { UserService } from '../user/user.service';
import { Reflector } from '@nestjs/core';
import { TenantAccessGuard } from '../auth/guards/tenantAccess.guard';
import { RolePermissionService } from '../rolePermission/rolePermission.service';
import { PermissionGuard } from '../auth/guards/permisson.guard';
import { ApproverType } from './enums/department.enum';

describe('DepartmentController', () => {
  let departmentController: DepartmentController;
  let departmentService: DepartmentService;
  let i18nService: I18nService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [
        {
          provide: DepartmentService,
          useValue: {
            createDepartment: jest.fn(),
            getAllDepartments: jest.fn(),
            getOneDepartment: jest.fn(),
            updateDepartment: jest.fn(),
            deleteDepartment: jest.fn(),
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

    departmentController =
      module.get<DepartmentController>(DepartmentController);
    departmentService = module.get<DepartmentService>(DepartmentService);
    i18nService = module.get<I18nService>(I18nService);
  });

  describe('createDepartment', () => {
    it('should create a new department', async () => {
      const createDepartmentDto: CreateDepartmentDto = {
        name: 'Engineering',
        approverType:ApproverType.ALL,
        isDefault: false,
        approvers: [],
        users: [],
      };
      const department: any = { id: 1, ...createDepartmentDto };
      jest
        .spyOn(departmentService, 'createDepartment')
        .mockResolvedValue(department);

      const result =
        await departmentController.createDepartment(createDepartmentDto);

      expect(result).toEqual(
        new SuccessResponse(
          'departments.create.success',
          department,
          HttpStatus.CREATED
        )
      );
      expect(departmentService.createDepartment).toHaveBeenCalledWith(
        createDepartmentDto
      );
    });
  });

  describe('getAllDepartments', () => {
    it('should return a list of departments', async () => {
      const departments: any = [
        { id: '1', name: 'Engineering' },
        { id: '2', name: 'Sales' },
      ];
      jest.spyOn(departmentService, 'getAllDepartments').mockResolvedValue({
        docs: departments,
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

      const result = await departmentController.getAllDepartments({
        page: 1,
        limit: 10,
      });

      expect(result);
      expect(departmentService.getAllDepartments).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getDepartment', () => {
    it('should return a department by id', async () => {
      const department: any = { id: '1', name: 'Engineering' };
      jest
        .spyOn(departmentService, 'getOneDepartment')
        .mockResolvedValue(department);

      const result = await departmentController.getDepartment('1');

      expect(result).toEqual(
        new SuccessResponse('departments.get.success', department)
      );
      expect(departmentService.getOneDepartment).toHaveBeenCalledWith('1');
    });
  });

  describe('updateDepartment', () => {
    it('should update a department', async () => {
      const updateDepartmentDto: UpdateDepartmentDto = {
        name: 'Engineering Team',
      };
      const updatedDepartment: any = { id: '1', name: 'Engineering Team' };
      jest
        .spyOn(departmentService, 'updateDepartment')
        .mockResolvedValue(updatedDepartment);

      const result = await departmentController.updateDepartment(
        '1',
        updateDepartmentDto
      );

      expect(result).toEqual(
        new SuccessResponse('departments.update.success', updatedDepartment)
      );
      expect(departmentService.updateDepartment).toHaveBeenCalledWith(
        '1',
        updateDepartmentDto
      );
    });
  });

  describe('deleteDepartment', () => {
    it('should delete a department', async () => {
      const department: any = { id: '1', name: 'Engineering' };
      jest
        .spyOn(departmentService, 'deleteDepartment')
        .mockResolvedValue(department);

      const result = await departmentController.deleteDepartment('1');

      expect(result);
      expect(departmentService.deleteDepartment).toHaveBeenCalledWith('1');
    });
  });
});
