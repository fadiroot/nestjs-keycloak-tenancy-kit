import { Test, TestingModule } from '@nestjs/testing';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/createLeave.dto';
import { UpdateLeaveDto } from './dto/updateLeave.dto';
import { UpdateStatusLeave } from './dto/updateStatusLeave.dto';
import { I18nService } from 'nestjs-i18n';
import { HttpStatus } from '@nestjs/common';
import {
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';
import { LeaveStatus } from './interfaces/leave.interfaces';
import { UserService } from '../user/user.service';
import { Reflector } from '@nestjs/core';
import { TenantAccessGuard } from '../auth/guards/tenantAccess.guard';
import { IUserRequest } from '../user/interfaces/user.interface';
import { RolePermissionService } from '../rolePermission/rolePermission.service';
import { PermissionGuard } from '../auth/guards/permisson.guard';

jest.mock('./leave.service');

const mockLeave = {
  id: 'b3e994a2-bb10-42e6-8d6f-6b326a9d11f8',
  userId: '12fd49e1-892c-402c-8621-1528d131ad26',
  leaveTypeId: '12fd49e1-892c-402c-8621-1528d131ad26',
  startDate: new Date(),
  endDate: new Date(),
  comment: 'Vacation',
  reason: 'Vacation',
  status: LeaveStatus.PENDING,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockPaginatedLeaves = {
  docs: [mockLeave],
  meta: {
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    hasMore: false,
  },
};
const req: IUserRequest = {
  user: {
    id: '12fd49e1-892c-402c-8621-1528d131ad26',
  },
  headers: {},
  method: 'GET',
  url: '/',
  body: {},
  query: {},
  params: {},
  cookies: {},
} as unknown as IUserRequest;

describe('LeaveController', () => {
  let leaveController: LeaveController;
  let leaveService: LeaveService;
  let i18nService: I18nService;

  const mockLeave = {
    id: 'b3e994a2-bb10-42e6-8d6f-6b326a9d11f8',
    userId: '12fd49e1-892c-402c-8621-1528d131ad26',
    leaveTypeId: '12fd49e1-892c-402c-8621-1528d131ad26',
    startDate: new Date(),
    endDate: new Date(),
    comment: 'Vacation',
    status: LeaveStatus.PENDING,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPaginatedLeaves = {
    docs: [mockLeave],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      hasMore: false,
    },
  };

  const req: IUserRequest = {
    user: {
      id: '12fd49e1-892c-402c-8621-1528d131ad26',
    },
    headers: {},
    method: 'GET',
    url: '/',
    body: {},
    query: {},
    params: {},
    cookies: {},
  } as unknown as IUserRequest;

  // Mock implementation of PermissionGuard
  const mockPermissionGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveController],
      providers: [
        LeaveService,
        {
          provide: I18nService,
          useValue: { t: jest.fn().mockImplementation((key: string) => key) },
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
          useValue: mockPermissionGuard,
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
            getAllAndMerge: jest.fn(),
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(TenantAccessGuard)
      .useValue({ canActivate: () => true })
      .compile();

    leaveController = module.get<LeaveController>(LeaveController);
    leaveService = module.get<LeaveService>(LeaveService);
    i18nService = module.get<I18nService>(I18nService);
  });

  describe('createLeave', () => {
    it('should create a new leave', async () => {
      const createLeaveDto: CreateLeaveDto = {
        userId: mockLeave.userId,
        leaveTypeId: mockLeave.leaveTypeId,
        startDate: mockLeave.startDate,
        endDate: mockLeave.endDate,
        comment: mockLeave.comment,
        status: LeaveStatus.PENDING,
      };

      jest.spyOn(leaveService, 'createLeave').mockResolvedValue(mockLeave);

      const result: any = await leaveController.createLeave(
        req,
        createLeaveDto
      );

      expect(result).toEqual(
        new SuccessResponse(
          'leaves.create.success',
          mockLeave,
          HttpStatus.CREATED
        )
      );
    });
  });

  describe('getAllLeavesByEmployee', () => {
    it('should return a list of leaves with pagination', async () => {
      jest
        .spyOn(leaveService, 'getAllLeavesByEmployee')
        .mockResolvedValue(mockPaginatedLeaves);

      const queryParams = { page: 1, limit: 10 };
      const result = await leaveController.getAllLeavesByEmployee(
        req,
        queryParams
      );

      expect(result).toEqual(
        new SuccessResponsePaginate(
          'leaves.getAll.success',
          mockPaginatedLeaves.docs,
          mockPaginatedLeaves.meta
        )
      );
      expect(leaveService.getAllLeavesByEmployee).toHaveBeenCalledWith(
        mockLeave.userId,
        queryParams
      );
    });
  });

  describe('getAllLeavesByApprover', () => {
    it('should return a list of leaves with pagination for approver', async () => {
      jest
        .spyOn(leaveService, 'getAllLeavesByApprover')
        .mockResolvedValue(mockPaginatedLeaves);

      const queryParams = { page: 1, limit: 10 };
      const result = await leaveController.getAllLeavesByApprover(
        req,
        queryParams
      );
      expect(result).toEqual(
        new SuccessResponsePaginate(
          'leaves.getAll.success',
          mockPaginatedLeaves.docs,
          mockPaginatedLeaves.meta
        )
      );
      expect(leaveService.getAllLeavesByApprover).toHaveBeenCalledWith(
        mockLeave.userId,
        queryParams
      );
    });
  });

  describe('updateLeave', () => {
    it('should update a leave', async () => {
      const updateLeaveDto: UpdateLeaveDto = {
        leaveTypeId: mockLeave.leaveTypeId,
        comment: 'Updated Comment',
      };

      const updatedLeave = { ...mockLeave, comment: updateLeaveDto.comment };
      jest.spyOn(leaveService, 'updateLeave').mockResolvedValue(updatedLeave);

      const result = await leaveController.updateLeave(
        req,
        mockLeave.id,
        updateLeaveDto
      );

      expect(result).toEqual(
        new SuccessResponse('leaves.update.success', updatedLeave)
      );
      expect(leaveService.updateLeave).toHaveBeenCalledWith(
        mockLeave.id,
        updateLeaveDto,
        req.user
      );
    });
  });

  describe('UpdateStatusLeaveByApprover', () => {
    it('should update a leave status by approver', async () => {
      const updateStatusLeave: UpdateStatusLeave = {
        status: LeaveStatus.APPROVED,
        reason: 'Approved by approver',
      };

      const updatedLeave = { ...mockLeave, status: updateStatusLeave.status };
      jest.spyOn(leaveService, 'updateLeave').mockResolvedValue(updatedLeave);

      const result = await leaveController.UpdateStatusLeaveByApprover(
        req,
        mockLeave.id,
        updateStatusLeave
      );

      expect(result).toEqual(
        new SuccessResponse('leaves.update.success', updatedLeave)
      );
      expect(leaveService.updateLeave).toHaveBeenCalledWith(
        mockLeave.id,
        updateStatusLeave,
        req.user
      );
    });
  });

  describe('getLeave', () => {
    it('should return a leave by ID', async () => {
      jest.spyOn(leaveService, 'getOneLeave').mockResolvedValue(mockLeave);

      const result = await leaveController.getLeave(mockLeave.id);

      expect(result).toEqual(
        new SuccessResponse('leaves.get.success', mockLeave)
      );
      expect(leaveService.getOneLeave).toHaveBeenCalledWith(mockLeave.id);
    });
  });

  describe('deleteLeave', () => {
    it('should delete a leave', async () => {
      jest.spyOn(leaveService, 'deleteLeave').mockResolvedValue(mockLeave);

      const result = await leaveController.deleteLeave(mockLeave.id);

      expect(result).toEqual(
        expect.objectContaining({ message: 'leaves.delete.success' })
      );
      expect(leaveService.deleteLeave).toHaveBeenCalledWith(mockLeave.id);
    });
  });
});
