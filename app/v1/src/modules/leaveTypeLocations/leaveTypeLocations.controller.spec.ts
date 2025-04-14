import { Test, TestingModule } from '@nestjs/testing';
import { LeaveTypeLocationsController } from './leaveTypeLocations.controller';
import { LeaveTypeLocationsService } from './leaveTypeLocations.service';
import { I18nService } from 'nestjs-i18n';
import { HttpStatus } from '@nestjs/common';
import {
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';

describe('LeaveTypeLocationsController', () => {
  let controller: LeaveTypeLocationsController;
  let service: LeaveTypeLocationsService;
  let i18nService: I18nService;

  const mockLeaveTypeLocationsService = {
    getAllLeaveTypeLocationsByLeaveTypeId: jest.fn(),
    getOneLeaveTypeLocation: jest.fn(),
    deleteLeaveTypeLocation: jest.fn(),
  };

  const mockI18nService = {
    t: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveTypeLocationsController],
      providers: [
        {
          provide: LeaveTypeLocationsService,
          useValue: mockLeaveTypeLocationsService,
        },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    controller = module.get<LeaveTypeLocationsController>(
      LeaveTypeLocationsController
    );
    service = module.get<LeaveTypeLocationsService>(LeaveTypeLocationsService);
    i18nService = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllLeaveTypeLocationsByLeaveTypeId', () => {
    it('should get all leave type locations by leave type ID', async () => {
      const mockResponse: any = {
        docs: [{ locationId: 'uuid1', leaveTypeId: 'uuid2' }],
        meta: { totalDocs: 1, limit: 10, page: 1, totalPages: 1 },
      };
      mockLeaveTypeLocationsService.getAllLeaveTypeLocationsByLeaveTypeId.mockResolvedValue(
        mockResponse
      );
      mockI18nService.t.mockResolvedValue(
        'Leave type locations retrieved successfully'
      );

      const result = await controller.getAllLeaveTypeLocationsByLeaveTypeId(
        'uuid2',
        {
          page: 1,
          limit: 10,
        }
      );
      expect(result).toEqual(
        new SuccessResponsePaginate(
          'Leave type locations retrieved successfully',
          mockResponse.docs,
          mockResponse.meta
        )
      );
    });

    it('should handle error when retrieving leave type locations', async () => {
      mockLeaveTypeLocationsService.getAllLeaveTypeLocationsByLeaveTypeId.mockRejectedValue(
        new Error('Failed to retrieve')
      );

      await expect(
        controller.getAllLeaveTypeLocationsByLeaveTypeId('uuid2', {
          page: 1,
          limit: 10,
        })
      ).rejects.toThrowError('Failed to retrieve');
    });
  });

  describe('getLeaveTypeLocation', () => {
    it('should get a specific leave type location by leave type ID and location ID', async () => {
      const mockResponse = { locationId: 'uuid1', leaveTypeId: 'uuid2' };
      mockLeaveTypeLocationsService.getOneLeaveTypeLocation.mockResolvedValue(
        mockResponse
      );
      mockI18nService.t.mockResolvedValue(
        'Leave type location retrieved successfully'
      );

      const result = await controller.getLeaveTypeLocation('uuid2', 'uuid1');
      expect(result).toEqual(
        new SuccessResponse(
          'Leave type location retrieved successfully',
          mockResponse
        )
      );
    });

    it('should handle error when retrieving a specific leave type location', async () => {
      mockLeaveTypeLocationsService.getOneLeaveTypeLocation.mockRejectedValue(
        new Error('Leave type location not found')
      );

      await expect(
        controller.getLeaveTypeLocation('uuid2', 'uuid1')
      ).rejects.toThrowError('Leave type location not found');
    });
  });

  describe('deleteLeaveTypeLocation', () => {
    it('should delete a leave type location', async () => {
      const mockResponse = { locationId: 'uuid1', leaveTypeId: 'uuid2' };
      mockLeaveTypeLocationsService.deleteLeaveTypeLocation.mockResolvedValue(
        mockResponse
      );
      mockI18nService.t.mockResolvedValue(
        'Leave type location deleted successfully'
      );

      const result = await controller.deleteLeaveTypeLocation('uuid2', 'uuid1');
      expect(result).toEqual(
        new SuccessResponse(
          'Leave type location deleted successfully',
          mockResponse
        )
      );
    });

    it('should handle error when deleting a leave type location', async () => {
      mockLeaveTypeLocationsService.deleteLeaveTypeLocation.mockRejectedValue(
        new Error('Leave type location not found')
      );

      await expect(
        controller.deleteLeaveTypeLocation('uuid2', 'uuid1')
      ).rejects.toThrowError('Leave type location not found');
    });
  });
});
