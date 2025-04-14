import { Test, TestingModule } from '@nestjs/testing';
import { LeaveTypeDepartmentsController } from './leaveTypeDepartments.controller';
import { LeaveTypeDepartmentsService } from './leaveTypeDepartments.service';
import { I18nService } from 'nestjs-i18n';
import {
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';

describe('LeaveTypeDepartmentsController', () => {
  let controller: LeaveTypeDepartmentsController;
  let service: LeaveTypeDepartmentsService;

  const mockI18nService = {
    t: jest.fn(),
  };

  const mockLeaveTypeDepartmentsService = {
    getAllLeaveTypeDepartmentByLeaveTypeId: jest.fn(),
    getOneLeaveTypeDepartment: jest.fn(),
    deleteLeaveTypeDepartment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveTypeDepartmentsController],
      providers: [
        {
          provide: LeaveTypeDepartmentsService,
          useValue: mockLeaveTypeDepartmentsService,
        },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    controller = module.get<LeaveTypeDepartmentsController>(
      LeaveTypeDepartmentsController
    );
    service = module.get<LeaveTypeDepartmentsService>(
      LeaveTypeDepartmentsService
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllLeaveTypeDepartmentByLeaveTypeId', () => {
    it('should get all leave type department by leave type ID', async () => {
      const mockResponse: any = {
        docs: [{ locationId: 'uuid1', leaveTypeId: 'uuid2' }],
        meta: { totalDocs: 1, limit: 10, page: 1, totalPages: 1 },
      };
      mockLeaveTypeDepartmentsService.getAllLeaveTypeDepartmentByLeaveTypeId.mockResolvedValue(
        mockResponse
      );
      mockI18nService.t.mockResolvedValue(
        'Leave type department retrieved successfully'
      );

      const result = await controller.getAllLeaveTypeDepartmentsByLeaveTypeId(
        'uuid2',
        {
          page: 1,
          limit: 10,
        }
      );
      expect(result).toEqual(
        new SuccessResponsePaginate(
          'Leave type department retrieved successfully',
          mockResponse.docs,
          mockResponse.meta
        )
      );
    });

    it('should handle error when retrieving leave type department', async () => {
      mockLeaveTypeDepartmentsService.getAllLeaveTypeDepartmentByLeaveTypeId.mockRejectedValue(
        new Error('Failed to retrieve')
      );

      await expect(
        controller.getAllLeaveTypeDepartmentsByLeaveTypeId('uuid2', {
          page: 0,
          limit: 0,
        })
      ).rejects.toThrowError('Failed to retrieve');
    });
  });

  describe('getLeaveTypeDepartment', () => {
    it('should get a specific leave type department by leave type ID and department ID', async () => {
      const mockResponse = { departmentId: 'uuid1', leaveTypeId: 'uuid2' };
      mockLeaveTypeDepartmentsService.getOneLeaveTypeDepartment.mockResolvedValue(
        mockResponse
      );
      mockI18nService.t.mockResolvedValue(
        'Leave type department retrieved successfully'
      );

      const result = await controller.getLeaveTypeDepartment('uuid2', 'uuid1');
      expect(result).toEqual(
        new SuccessResponse(
          'Leave type department retrieved successfully',
          mockResponse
        )
      );
    });

    it('should handle error when retrieving a specific leave type department', async () => {
      mockLeaveTypeDepartmentsService.getOneLeaveTypeDepartment.mockRejectedValue(
        new Error('Leave type department not found')
      );

      await expect(
        controller.getLeaveTypeDepartment('uuid2', 'uuid1')
      ).rejects.toThrowError('Leave type department not found');
    });
  });

  describe('deleteLeaveTypeDepartment', () => {
    it('should delete a leave type department', async () => {
      const mockResponse = { departmentId: 'uuid1', leaveTypeId: 'uuid2' };
      mockLeaveTypeDepartmentsService.deleteLeaveTypeDepartment.mockResolvedValue(
        mockResponse
      );
      mockI18nService.t.mockResolvedValue(
        'Leave type department deleted successfully'
      );

      const result = await controller.deleteLeaveTypeDepartment(
        'uuid2',
        'uuid1'
      );
      expect(result).toEqual(
        new SuccessResponse(
          'Leave type department deleted successfully',
          mockResponse
        )
      );
    });

    it('should handle error when deleting a leave type department', async () => {
      mockLeaveTypeDepartmentsService.deleteLeaveTypeDepartment.mockRejectedValue(
        new Error('Leave type department not found')
      );

      await expect(
        controller.deleteLeaveTypeDepartment('uuid2', 'uuid1')
      ).rejects.toThrowError('Leave type department not found');
    });
  });
});
