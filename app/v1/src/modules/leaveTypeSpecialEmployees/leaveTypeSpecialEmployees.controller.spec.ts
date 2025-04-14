import { Test, TestingModule } from '@nestjs/testing';
import { LeaveTypeSpecialEmployeesController } from './leaveTypeSpecialEmployees.controller';
import { LeaveTypeSpecialEmployeesService } from './leaveTypeSpecialEmployees.service';
import { I18nService } from 'nestjs-i18n';
import {
  SuccessResponse,
  SuccessResponsePaginate,
} from '../../common/utils/response/response.util';

describe('LeaveTypeSpecialEmployeesController', () => {
  let controller: LeaveTypeSpecialEmployeesController;
  let service: LeaveTypeSpecialEmployeesService;

  const mockI18nService = {
    t: jest.fn().mockResolvedValue('Mocked Translation'),
  };

  const mockLeaveTypeSpecialEmployeesService = {
    getAllLeaveTypeSpecialEmployeesByLeaveTypeId: jest.fn().mockResolvedValue({
      docs: [{ id: '1', userId: '123', leaveTypeId: '456' }],
      meta: { totalDocs: 1, limit: 10, page: 1, totalPages: 1 },
    }),
    getOneLeaveTypeSpecialEmployee: jest.fn().mockResolvedValue({
      id: '1',
      userId: '123',
      leaveTypeId: '456',
    }),
    deleteLeaveTypeSpecialEmployee: jest.fn().mockResolvedValue({
      id: '1',
      userId: '123',
      leaveTypeId: '456',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveTypeSpecialEmployeesController],
      providers: [
        {
          provide: LeaveTypeSpecialEmployeesService,
          useValue: mockLeaveTypeSpecialEmployeesService,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    controller = module.get<LeaveTypeSpecialEmployeesController>(
      LeaveTypeSpecialEmployeesController
    );
    service = module.get<LeaveTypeSpecialEmployeesService>(
      LeaveTypeSpecialEmployeesService
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllLeaveTypeSpecialEmployees', () => {
    it('should retrieve a paginated list of leave type specialEmployees', async () => {
      const result = await controller.getAllLeaveTypeSpecialEmployees('456', {
        page: 1,
        limit: 10,
      });
      expect(
        service.getAllLeaveTypeSpecialEmployeesByLeaveTypeId
      ).toHaveBeenCalledWith('456', { page: 1, limit: 10 });
      expect(result).toEqual(
        new SuccessResponsePaginate(
          'Mocked Translation',
          [{ id: '1', userId: '123', leaveTypeId: '456' }],
          {
            totalDocs: 1,
            limit: 10,
            page: 1,
            totalPages: 1,
          }
        )
      );
    });
  });

  describe('getLeaveTypeSpecialEmployee', () => {
    it('should retrieve a single leave type specialEmployee by leaveTypeId and userId', async () => {
      const result = await controller.getLeaveTypeSpecialEmployee('456', '123');
      expect(service.getOneLeaveTypeSpecialEmployee).toHaveBeenCalledWith(
        '456',
        '123'
      );
      expect(result).toEqual(
        new SuccessResponse('Mocked Translation', {
          id: '1',
          userId: '123',
          leaveTypeId: '456',
        })
      );
    });
  });

  describe('deleteLeaveTypeSpecialEmployee', () => {
    it('should delete a leave type specialEmployee by leaveTypeId and userId', async () => {
      const result = await controller.deleteLeaveTypeSpecialEmployee(
        '456',
        '123'
      );
      expect(service.deleteLeaveTypeSpecialEmployee).toHaveBeenCalledWith(
        '456',
        '123'
      );
      expect(result).toEqual(
        new SuccessResponse('Mocked Translation', {
          id: '1',
          userId: '123',
          leaveTypeId: '456',
        })
      );
    });
  });
});
